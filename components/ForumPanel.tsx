'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessagesSquare, ChevronLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { isMissingTableError } from '@/lib/supabaseSetup';
import {
  FORUM_CATEGORIES,
  FORUM_SUBCATEGORIES,
  getForumCategory,
  getForumSubcategory,
  type ForumCategoryId,
  type ForumSubcategoryId,
} from '@/lib/forumCategories';
import {
  ForumPost,
  listLocalForumPosts,
  addLocalForumPost,
  formatForumDate,
} from '@/lib/forumStorage';
import { snapshotAvatarForPost } from '@/lib/imageCompress';
import ProfileAvatar from './ProfileAvatar';

interface ForumPanelProps {
  user: { id: string; username?: string } | null;
  displayHandle: string;
  displayAvatar?: string | null;
  onRequestSignIn: () => void;
  onOpenProfile?: () => void;
}

function mapSupabaseRow(row: {
  id: string;
  user_id: string;
  username: string;
  category: string;
  subcategory: string;
  title: string;
  body: string;
  author_avatar?: string | null;
  created_at: string;
}): ForumPost {
  return {
    id: row.id,
    category: row.category as ForumCategoryId,
    subcategory: row.subcategory as ForumSubcategoryId,
    title: row.title,
    body: row.body,
    author: row.username,
    authorAvatar: row.author_avatar ?? null,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

export default function ForumPanel({
  user,
  displayHandle,
  displayAvatar,
  onRequestSignIn,
  onOpenProfile,
}: ForumPanelProps) {
  const [category, setCategory] = useState<ForumCategoryId | null>(null);
  const [subcategory, setSubcategory] = useState<ForumSubcategoryId | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [useLocalOnly, setUseLocalOnly] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPosts = useCallback(async () => {
    if (!category || !subcategory) return;
    setLoading(true);

    if (useLocalOnly || !user) {
      setPosts(listLocalForumPosts(category, subcategory));
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('category', category)
      .eq('subcategory', subcategory)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error && isMissingTableError(error)) {
      setUseLocalOnly(true);
      setPosts(listLocalForumPosts(category, subcategory));
    } else if (error) {
      toast.error('Could not load forum posts.');
      setPosts(listLocalForumPosts(category, subcategory));
    } else {
      const remote = (data ?? []).map(mapSupabaseRow);
      const local = listLocalForumPosts(category, subcategory);
      const remoteIds = new Set(remote.map((p) => p.id));
      const merged = [
        ...remote,
        ...local.filter((p) => !remoteIds.has(p.id)),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(merged);
    }

    setLoading(false);
  }, [category, subcategory, useLocalOnly, user]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleSubmit = async () => {
    const title = newTitle.trim();
    const body = newBody.trim();
    if (!title || !body) return toast.error('Add a title and message.');
    if (!user) return onRequestSignIn();
    if (!category || !subcategory) return;

    setSubmitting(true);
    const author = displayHandle.trim() || user.username || 'RoadWarrior';
    const authorAvatar = await snapshotAvatarForPost(displayAvatar ?? null);
    const optimistic: ForumPost = {
      id: `local-${Date.now()}`,
      category,
      subcategory,
      title,
      body,
      author,
      authorAvatar,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => [optimistic, ...prev]);
    setNewTitle('');
    setNewBody('');
    setShowComposer(false);

    if (useLocalOnly) {
      addLocalForumPost(optimistic);
      toast.success('Posted to forum (saved on this device).');
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        user_id: user.id,
        username: author,
        category,
        subcategory,
        title,
        body,
        author_avatar: authorAvatar,
      })
      .select()
      .single();

    if (error) {
      setPosts((prev) => prev.filter((p) => p.id !== optimistic.id));
      if (isMissingTableError(error)) {
        setUseLocalOnly(true);
        addLocalForumPost(optimistic);
        setPosts((prev) => [optimistic, ...prev.filter((p) => p.id !== optimistic.id)]);
        toast.success('Posted locally — run supabase-setup.sql for cloud sync.');
      } else {
        toast.error('Could not post. Try again.');
      }
    } else if (data) {
      const saved = mapSupabaseRow(data);
      setPosts((prev) => [saved, ...prev.filter((p) => p.id !== optimistic.id)]);
      toast.success('Posted to the forum!');
    }

    setSubmitting(false);
  };

  const activeCategory = category ? getForumCategory(category) : null;
  const activeSubcategory = subcategory ? getForumSubcategory(subcategory) : null;

  if (!category) {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-1">
            <MessagesSquare className="w-4 h-4" />
            Camper Forum
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Share tips with fellow campers</h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-2xl">
            Pick a camper type, then browse topics like destination favorites, construction alerts, and maintenance advice.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FORUM_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`text-left p-5 rounded-3xl border-2 bg-slate-900 hover:bg-slate-900/80 transition ${cat.borderAccent}`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${
                  cat.id === 'rv' ? 'bg-emerald-900/40' : cat.id === 'tent' ? 'bg-sky-900/40' : 'bg-amber-900/40'
                }`}>
                  <Icon className={`w-5 h-5 ${cat.accent}`} />
                </div>
                <div className="font-semibold text-lg">{cat.label}</div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{cat.description}</p>
              </button>
            );
          })}
        </div>

        {!user && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-700 bg-slate-900/50">
            <p className="text-sm text-slate-400">Sign in to post your own threads. Browsing is open to everyone.</p>
            <button onClick={onRequestSignIn} className="shrink-0 bg-white text-black px-5 py-2 rounded-3xl text-sm font-semibold">
              Sign In
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!subcategory) {
    const CatIcon = activeCategory!.icon;
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
          All categories
        </button>

        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            category === 'rv' ? 'bg-emerald-900/40' : category === 'tent' ? 'bg-sky-900/40' : 'bg-amber-900/40'
          }`}>
            <CatIcon className={`w-6 h-6 ${activeCategory!.accent}`} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold">{activeCategory!.label}</h2>
            <p className="text-sm text-slate-400">Choose a topic</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {FORUM_SUBCATEGORIES.map((sub) => {
            const Icon = sub.icon;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSubcategory(sub.id)}
                className="text-left p-4 sm:p-5 rounded-2xl border border-slate-700 bg-slate-900 hover:border-slate-500 transition flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <div className="font-semibold">{sub.label}</div>
                  <p className="text-xs text-slate-400 mt-1">{sub.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const SubIcon = activeSubcategory!.icon;

  return (
    <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <button type="button" onClick={() => { setCategory(null); setSubcategory(null); }} className="hover:text-white transition">
          Forum
        </button>
        <span>/</span>
        <button type="button" onClick={() => setSubcategory(null)} className="hover:text-white transition">
          {activeCategory!.label}
        </button>
        <span>/</span>
        <span className="text-slate-300">{activeSubcategory!.label}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
            <SubIcon className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold truncate">{activeSubcategory!.label}</h2>
            <p className="text-xs text-slate-400">{activeCategory!.label}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => (user ? setShowComposer(true) : onRequestSignIn())}
          className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 px-4 h-10 rounded-2xl text-sm font-semibold shrink-0"
        >
          <Plus className="w-4 h-4" />
          New post
        </button>
      </div>

      {useLocalOnly && user && (
        <div className="text-xs text-amber-300/90 bg-amber-950/30 border border-amber-800/40 rounded-xl px-3 py-2">
          Forum posts save on this device until Supabase <code className="text-[10px]">forum_posts</code> table is set up.
        </div>
      )}

      {showComposer && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-5 space-y-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Post title"
            maxLength={120}
            className="w-full bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none focus:border-emerald-600"
          />
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Share your tip, warning, or favorite spot..."
            rows={4}
            className="w-full bg-slate-950 border border-slate-700 p-4 rounded-2xl text-sm outline-none focus:border-emerald-600 resize-y min-h-[100px]"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-slate-300 transition"
            >
              <ProfileAvatar handle={displayHandle} avatarUrl={displayAvatar} size="xs" />
              <span>
                Posting as{' '}
                <span className="text-emerald-300 font-medium">{displayHandle}</span>
              </span>
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowComposer(false); setNewTitle(''); setNewBody(''); }}
                className="px-4 h-10 rounded-2xl text-sm border border-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !newTitle.trim() || !newBody.trim()}
                className="px-5 h-10 rounded-2xl text-sm font-semibold bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40"
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-slate-500 text-sm py-12">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-700 rounded-2xl">
            <p className="text-slate-400 text-sm">No posts yet in this topic.</p>
            <button
              type="button"
              onClick={() => (user ? setShowComposer(true) : onRequestSignIn())}
              className="mt-3 text-sm text-emerald-400 hover:underline"
            >
              Be the first to share
            </button>
          </div>
        ) : (
          posts.map((post) => {
            const isMine = user && (post.userId === user.id || post.author === displayHandle);
            const postAvatar =
              post.authorAvatar ??
              (isMine ? displayAvatar : null);
            return (
              <article
                key={post.id}
                className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 ${
                  isMine ? 'border-emerald-800/50' : 'border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-base sm:text-lg leading-snug">{post.title}</h3>
                  <time className="text-[10px] text-slate-500 shrink-0">{formatForumDate(post.createdAt)}</time>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{post.body}</p>
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs">
                  <ProfileAvatar handle={post.author} avatarUrl={postAvatar} size="xs" />
                  <span className={`font-medium ${isMine ? 'text-emerald-300' : 'text-slate-300'}`}>
                    @{post.author}
                  </span>
                  {isMine && <span className="text-[10px] text-emerald-600">you</span>}
                </div>
              </article>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={() => setSubcategory(null)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition pt-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to {activeCategory!.label} topics
      </button>
    </div>
  );
}