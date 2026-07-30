'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Package, Wrench, Plus, Search, Star, Trash2, Pencil, X, MessageCircle, ImagePlus, ShieldCheck, List,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  MarketKind,
  MarketListing,
  MarketCondition,
  FREE_ACTIVE_LISTING_LIMIT,
  MAX_LISTING_PHOTOS,
  GEAR_CATEGORIES,
  PARTS_CATEGORIES,
  CONDITION_LABELS,
  formatMarketPrice,
  categoryLabel,
  fetchActiveListings,
  fetchMyListings,
  fetchMarketProfile,
  upsertMarketProfile,
  createListing,
  updateListing,
  softDeleteListing,
  canPublishListing,
  uploadListingImages,
  adminSetListingFeatured,
  isSupabaseConfigured,
} from '@/lib/marketListings';
import { US_STATE_CODES } from '@/lib/usStates';
import { isModerator } from '@/lib/moderator';
import { compressImageFile } from '@/lib/imageCompress';
import MarketplaceDisclosure from './MarketplaceDisclosure';

type View = 'browse' | 'sell' | 'mine';

interface Props {
  user: { id: string; email?: string; username?: string } | null;
  displayHandle: string;
  onRequestSignIn: () => void;
}

const EMPTY_FORM = {
  kind: 'gear' as MarketKind,
  title: '',
  description: '',
  price: '',
  condition: 'good' as MarketCondition,
  city: '',
  state: 'TX',
  category: 'other',
  contact_email: '',
  contact_phone: '',
  featured: false,
};

export default function MarketLive({ user, displayHandle, onRequestSignIn }: Props) {
  const [view, setView] = useState<View>('browse');
  const [kindFilter, setKindFilter] = useState<MarketKind | 'all'>('all');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [mine, setMine] = useState<MarketListing[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellerPro, setSellerPro] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState<MarketListing | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const isAdmin = isModerator(user);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { listings: rows, error } = await fetchActiveListings({
      kind: kindFilter,
      state: stateFilter || undefined,
      q: search || undefined,
    });
    setListings(rows);
    setLoadError(error ?? null);
    if (user) {
      const my = await fetchMyListings(user.id);
      setMine(my);
      const gate = await canPublishListing(user.id);
      setSellerPro(gate.sellerPro);
      setActiveCount(gate.activeCount);
      const profile = await fetchMarketProfile(user.id);
      if (profile) {
        setForm((f) => ({
          ...f,
          contact_email: profile.contact_email || user.email || '',
          contact_phone: profile.contact_phone || '',
        }));
      } else if (user.email) {
        setForm((f) => ({ ...f, contact_email: user.email || '' }));
      }
    } else {
      setMine([]);
      setSellerPro(false);
      setActiveCount(0);
    }
    setLoading(false);
  }, [kindFilter, stateFilter, search, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const categories = form.kind === 'gear' ? GEAR_CATEGORIES : PARTS_CATEGORIES;

  const onPickPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const next: File[] = [...photoFiles];
    const previews: string[] = [...photoPreviews];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_LISTING_PHOTOS) break;
      try {
        const dataUrl = await compressImageFile(file, 1400, 0.8, 700_000);
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const compressed = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
          type: 'image/jpeg',
        });
        next.push(compressed);
        previews.push(dataUrl);
      } catch {
        toast.error(`Could not process ${file.name}`);
      }
    }
    setPhotoFiles(next);
    setPhotoPreviews(previews);
  };

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
      contact_email: user?.email || '',
    });
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setExistingImages([]);
    setEditingId(null);
  };

  const startEdit = (l: MarketListing) => {
    setEditingId(l.id);
    setForm({
      kind: l.kind,
      title: l.title,
      description: l.description,
      price: String(l.price),
      condition: l.condition,
      city: l.city,
      state: l.state,
      category: l.category,
      contact_email: l.contact_email || user?.email || '',
      contact_phone: l.contact_phone || '',
      featured: l.featured,
    });
    setExistingImages(l.images);
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setView('sell');
  };

  const publish = async () => {
    if (!user) return onRequestSignIn();
    if (!form.title.trim()) return toast.error('Title required');
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) return toast.error('Valid price required');
    if (!form.city.trim() || !form.state.trim()) return toast.error('City and state required');
    if (!form.contact_email.trim() && !form.contact_phone.trim()) {
      return toast.error('Add an email or phone so buyers can contact you');
    }

    setSubmitting(true);
    try {
      await upsertMarketProfile(user.id, {
        contact_email: form.contact_email.trim() || null,
        contact_phone: form.contact_phone.trim() || null,
        display_name: displayHandle,
      });

      let imageUrls = [...existingImages];
      if (photoFiles.length > 0) {
        const up = await uploadListingImages(user.id, photoFiles);
        if (up.error && imageUrls.length === 0) {
          toast.error(up.error);
          setSubmitting(false);
          return;
        }
        imageUrls = [...imageUrls, ...up.urls].slice(0, MAX_LISTING_PHOTOS);
      }

      if (editingId) {
        const { error } = await updateListing(user.id, editingId, {
          kind: form.kind,
          title: form.title.trim(),
          description: form.description.trim(),
          price,
          condition: form.condition,
          city: form.city.trim(),
          state: form.state.trim().toUpperCase().slice(0, 2),
          category: form.category,
          images: imageUrls,
          contact_email: form.contact_email.trim() || null,
          contact_phone: form.contact_phone.trim() || null,
          featured: form.featured,
        });
        if (error) throw new Error(error);
        toast.success('Listing updated');
      } else {
        const { error } = await createListing(user.id, {
          kind: form.kind,
          title: form.title.trim(),
          description: form.description.trim(),
          price,
          condition: form.condition,
          city: form.city.trim(),
          state: form.state.trim().toUpperCase().slice(0, 2),
          category: form.category,
          images: imageUrls,
          contact_email: form.contact_email.trim() || null,
          contact_phone: form.contact_phone.trim() || null,
          featured: form.featured,
        });
        if (error) throw new Error(error);
        toast.success('Listing published');
      }
      resetForm();
      setView('mine');
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save listing');
    } finally {
      setSubmitting(false);
    }
  };

  const removeMine = async (id: string) => {
    if (!user) return;
    if (!confirm('Remove this listing?')) return;
    const { error } = await softDeleteListing(user.id, id);
    if (error) toast.error(error);
    else {
      toast.success('Listing removed');
      await refresh();
    }
  };

  const toggleFeaturedAdmin = async (l: MarketListing) => {
    const { error } = await adminSetListingFeatured(l.id, !l.featured);
    if (error) toast.error(error);
    else {
      toast.success(l.featured ? 'Unfeatured' : 'Featured');
      await refresh();
    }
  };

  const filtered = useMemo(() => listings, [listings]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 pb-10 space-y-5">
      <div className="rounded-3xl border border-amber-700/40 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 p-5 sm:p-7">
        <div className="text-amber-400 text-sm font-medium mb-1">rvchain Market</div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Gear &amp; Parts</h2>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl">
          Private-party gear and parts for recreational vehicles — campers, off-road trucks, ATV, dirt bike,
          snowmobile life. Contact sellers directly. No escrow. No whole-vehicle sales. No campground
          directory.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              if (!user) return onRequestSignIn();
              resetForm();
              setView('sell');
            }}
            className="h-11 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> List your gear
          </button>
          <button
            type="button"
            onClick={() => setView('browse')}
            className="h-11 px-5 rounded-2xl border border-slate-600 hover:bg-slate-800 text-sm font-semibold"
          >
            Browse the market
          </button>
        </div>
        {user && (
          <p className="text-xs text-slate-500 mt-3">
            {sellerPro
              ? 'Seller Pro · unlimited active listings · can feature'
              : `Free plan · ${activeCount}/${FREE_ACTIVE_LISTING_LIMIT} active listings used`}
          </p>
        )}
      </div>

      {!isSupabaseConfigured && (
        <div className="rounded-2xl border border-amber-800/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
          Connect Supabase keys in env and run <code className="text-amber-50">supabase-marketplace.sql</code> to
          enable live listings.
        </div>
      )}

      {loadError && (
        <div className="rounded-2xl border border-rose-800/40 bg-rose-950/20 px-4 py-3 text-sm text-rose-100">
          {loadError}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['browse', 'Browse', Search],
            ['sell', 'Sell', Plus],
            ['mine', 'My listings', List],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={`px-3 sm:px-4 h-10 rounded-2xl text-sm font-semibold border flex items-center gap-1.5 ${
              view === id
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'border-slate-700 text-slate-300 hover:border-slate-500 bg-slate-900/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {view === 'browse' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gear & parts…"
                className="w-full bg-slate-900 border border-slate-700 pl-10 pr-3 h-11 rounded-2xl text-sm outline-none focus:border-amber-600"
              />
            </div>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as MarketKind | 'all')}
              className="sm:w-36 bg-slate-900 border border-slate-700 h-11 px-3 rounded-2xl text-sm"
            >
              <option value="all">All</option>
              <option value="gear">Gear</option>
              <option value="parts">Parts</option>
            </select>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="sm:w-32 bg-slate-900 border border-slate-700 h-11 px-3 rounded-2xl text-sm"
            >
              <option value="">All states</option>
              {US_STATE_CODES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-center text-slate-500 py-12 text-sm">Loading listings…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14 space-y-3 border border-dashed border-slate-700 rounded-3xl">
              <p className="text-slate-400 text-sm">No listings yet — be the first.</p>
              <button
                type="button"
                onClick={() => {
                  if (!user) return onRequestSignIn();
                  setView('sell');
                }}
                className="text-amber-400 font-semibold text-sm"
              >
                List your gear →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((l) => (
                <article
                  key={l.id}
                  className="rounded-3xl border border-slate-700 bg-slate-900 overflow-hidden flex flex-col"
                >
                  <div className="relative h-40 bg-slate-800">
                    {l.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        {l.kind === 'gear' ? <Package className="w-10 h-10" /> : <Wrench className="w-10 h-10" />}
                      </div>
                    )}
                    {l.featured && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">
                      {l.kind} · {categoryLabel(l.kind, l.category)}
                    </div>
                    <h3 className="font-semibold text-white leading-snug line-clamp-2">{l.title}</h3>
                    <div className="text-lg font-bold text-amber-300">{formatMarketPrice(l.price)}</div>
                    <div className="text-xs text-slate-400">
                      {CONDITION_LABELS[l.condition]} · {l.city}, {l.state}
                    </div>
                    <div className="mt-auto pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDetail(l);
                          setContactOpen(false);
                        }}
                        className="flex-1 h-10 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-sm font-semibold"
                      >
                        View
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => toggleFeaturedAdmin(l)}
                          className="px-3 h-10 rounded-xl border border-amber-700 text-amber-300 text-xs"
                          title="Admin: toggle featured"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'sell' && (
        <div className="max-w-2xl space-y-4">
          <MarketplaceDisclosure />
          {!user ? (
            <button type="button" onClick={onRequestSignIn} className="text-sky-400 font-semibold text-sm">
              Sign in to list →
            </button>
          ) : (
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-3">
              <div className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                {editingId ? 'Edit listing' : 'New listing'}
              </div>
              <div className="flex gap-2">
                {(['gear', 'parts'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, kind: k, category: 'other' }))
                    }
                    className={`px-4 h-10 rounded-xl text-sm font-semibold border ${
                      form.kind === k
                        ? 'bg-amber-600 border-amber-500 text-white'
                        : 'border-slate-700 text-slate-300'
                    }`}
                  >
                    {k === 'gear' ? 'Camping gear' : 'Parts'}
                  </button>
                ))}
              </div>
              <input
                className="w-full bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              <textarea
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-sm"
                rows={4}
                placeholder="Description — condition notes, what’s included…"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                  placeholder="Price $"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
                <select
                  className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                  value={form.condition}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, condition: e.target.value as MarketCondition }))
                  }
                >
                  {(Object.entries(CONDITION_LABELS) as [MarketCondition, string][]).map(
                    ([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {Object.entries(categories).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <select
                  className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                >
                  {US_STATE_CODES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <input
                className="w-full bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="email"
                  className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                  placeholder="Contact email"
                  value={form.contact_email}
                  onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
                />
                <input
                  type="tel"
                  className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                  placeholder="Contact phone (optional)"
                  value={form.contact_phone}
                  onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer border border-dashed border-slate-600 rounded-2xl h-12 px-4 hover:border-amber-600">
                  <ImagePlus className="w-4 h-4 text-amber-400" />
                  Add photos (up to {MAX_LISTING_PHOTOS})
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => void onPickPhotos(e.target.files)}
                  />
                </label>
                {(photoPreviews.length > 0 || existingImages.length > 0) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {existingImages.map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={src} src={src} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    ))}
                    {photoPreviews.map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={src} src={src} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    ))}
                  </div>
                )}
              </div>
              {sellerPro && (
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  />
                  Feature this listing (Seller Pro)
                </label>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 h-11 rounded-xl border border-slate-600 text-sm"
                >
                  Clear
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void publish()}
                  className="flex-1 h-11 rounded-xl bg-amber-600 hover:bg-amber-500 font-semibold text-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Publish listing'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'mine' && (
        <div className="space-y-3">
          {!user ? (
            <button type="button" onClick={onRequestSignIn} className="text-sky-400 font-semibold text-sm">
              Sign in to manage listings
            </button>
          ) : mine.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">You have no listings yet.</p>
          ) : (
            mine.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-2xl p-3"
              >
                <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                  {l.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{l.title}</div>
                  <div className="text-xs text-slate-500">
                    {formatMarketPrice(l.price)} · {l.status}
                    {l.featured ? ' · Featured' : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(l)}
                  className="p-2 text-sky-400"
                  aria-label="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void removeMine(l.id)}
                  className="p-2 text-red-400"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {detail && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-semibold">
                  {detail.kind} · {categoryLabel(detail.kind, detail.category)}
                </div>
                <h3 className="text-xl font-semibold text-white">{detail.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {detail.city}, {detail.state}
                  {detail.seller_name ? ` · ${detail.seller_name}` : ''}
                </p>
              </div>
              <button type="button" onClick={() => setDetail(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            {detail.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {detail.images.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="h-40 w-auto rounded-xl object-cover shrink-0"
                  />
                ))}
              </div>
            )}
            <div className="text-2xl font-bold text-amber-300">
              {formatMarketPrice(detail.price)}
            </div>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{detail.description}</p>
            <p className="text-xs text-slate-500">
              Condition: {CONDITION_LABELS[detail.condition]}. Transactions are between you and the
              seller off-platform. rvchain does not process payments.
            </p>
            <div className="space-y-2">
              {!contactOpen ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      toast.info('Sign in to view seller contact details');
                      onRequestSignIn();
                      return;
                    }
                    setContactOpen(true);
                  }}
                  className="w-full h-12 rounded-2xl bg-emerald-700 hover:bg-emerald-600 font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Contact seller
                </button>
              ) : (
                <div className="rounded-2xl border border-emerald-800/50 bg-emerald-950/30 p-4 space-y-2 text-sm">
                  <div className="font-semibold text-emerald-200">Seller contact</div>
                  {detail.contact_email && (
                    <a
                      href={`mailto:${detail.contact_email}?subject=${encodeURIComponent(
                        `rvchain: ${detail.title}`
                      )}`}
                      className="block text-sky-300 underline"
                    >
                      {detail.contact_email}
                    </a>
                  )}
                  {detail.contact_phone && (
                    <a href={`tel:${detail.contact_phone}`} className="block text-sky-300 underline">
                      {detail.contact_phone}
                    </a>
                  )}
                  {!detail.contact_email && !detail.contact_phone && (
                    <p className="text-slate-400 text-xs">
                      Seller has not published contact info. Message them via the site contact form
                      and mention this listing.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
