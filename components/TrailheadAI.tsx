'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Sparkles, Send, ImagePlus, X, Lock, Mountain, Wrench, Map, ClipboardList, Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import {
  TRAILHEAD_MODES,
  FREE_AI_MESSAGES_PER_DAY,
  type TrailheadMode,
} from '@/lib/trailheadAi';
import {
  canSendFreeMessage,
  getAiUsageToday,
  hasClientAiPro,
  incrementAiUsage,
} from '@/lib/aiUsage';
import { compressImageFile } from '@/lib/imageCompress';
type Msg = { role: 'user' | 'assistant'; content: string; imagePreview?: string };

interface Props {
  user: { id: string; email?: string } | null;
  onRequestSignIn: () => void;
  onGoMarket: () => void;
}

const MODE_ICONS: Record<TrailheadMode, typeof Wrench> = {
  parts: Wrench,
  trip: Map,
  checklist: ClipboardList,
  listing: Tag,
  general: Mountain,
};

export default function TrailheadAI({ user, onRequestSignIn, onGoMarket }: Props) {
  const [mode, setMode] = useState<TrailheadMode>('general');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        'I’m Trailhead AI — co-pilot for recreational vehicle life: road campers, overland trucks, ATVs, dirt bikes, snowmobiles, and the gear that goes with them.\n\nPick a mode, ask a question, or upload a part photo. Suggestions are educational only — verify safety and fitment yourself.',
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [aiPro, setAiPro] = useState(false);
  const [usage, setUsage] = useState(() => getAiUsageToday(user?.id));
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUsage(getAiUsageToday(user?.id));
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        setAiPro(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('ai_pro, is_admin')
        .eq('id', user.id)
        .maybeSingle();
      if (!cancelled) {
        setAiPro(hasClientAiPro(user, Boolean(data?.ai_pro || data?.is_admin)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const onPickImage = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 1280, 0.8, 800_000);
      setImageDataUrl(dataUrl);
      if (mode === 'general') setMode('parts');
    } catch {
      toast.error('Could not process that image');
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text && !imageDataUrl) return;

    if (!aiPro && !canSendFreeMessage(user?.id)) {
      toast.error(`Free daily limit reached (${FREE_AI_MESSAGES_PER_DAY}). AI Pro unlocks unlimited � ask admin@rv-chain.com`);
      return;
    }

    const userMsg: Msg = {
      role: 'user',
      content: text || 'What can you tell me about this image?',
      imagePreview: imageDataUrl || undefined,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    const img = imageDataUrl;
    setImageDataUrl(null);
    setBusy(true);

    try {
      const usedBefore = getAiUsageToday(user?.id).used;
      let authHeader: string | undefined;
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.access_token) {
        authHeader = `Bearer ${sessionData.session.access_token}`;
      }

      const apiMessages = nextHistory
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({
          mode,
          messages: apiMessages,
          imageDataUrl: img,
          freeTierUsed: aiPro ? 0 : usedBefore,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        if (data.code === 'LIMIT') {
          toast.error(data.error || 'Daily limit reached');
        } else {
          toast.error(data.error || 'Trailhead AI unavailable');
        }
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            content:
              data.error ||
              'Sorry — I could not answer just now. Check that XAI_API_KEY is set on the server, or try again.',
          },
        ]);
        return;
      }

      if (!aiPro) {
        incrementAiUsage(user?.id);
        setUsage(getAiUsageToday(user?.id));
      }

      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: data.reply || '…',
        },
      ]);
    } catch {
      toast.error('Network error');
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Network error. Please try again.' },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const placeholder =
    TRAILHEAD_MODES.find((m) => m.id === mode)?.placeholder || 'Ask Trailhead AI…';

  return (
    <div className="max-w-screen-lg mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-4 pb-8">
      <div className="rounded-3xl border border-violet-600/40 bg-gradient-to-br from-violet-950 via-slate-900 to-amber-950/40 p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-violet-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-violet-300 text-xs font-bold uppercase tracking-[0.15em]">
              Trailhead AI
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Road. Trail. Ready.
            </h2>
            <p className="text-sm text-slate-200 mt-2 leading-relaxed max-w-2xl">
              AI co-pilot for recreational vehicles — campers, overland trucks, ATVs, dirt bikes,
              snowmobiles, and gear. Not a dealer. Not a campground directory.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          {aiPro ? (
            <span className="px-3 py-1.5 rounded-full bg-violet-500/30 text-violet-100 border border-violet-400/40">
              AI Pro · unlimited today
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-200 border border-slate-600">
              Free · {usage.remaining}/{usage.limit} left today
            </span>
          )}
          <button
            type="button"
            onClick={onGoMarket}
            className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-100 border border-amber-500/40 hover:bg-amber-500/30"
          >
            Browse Market gear →
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TRAILHEAD_MODES.map((m) => {
          const Icon = MODE_ICONS[m.id];
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`px-3 h-10 rounded-2xl text-sm font-semibold border flex items-center gap-1.5 ${
                active
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'border-slate-600 text-slate-200 bg-slate-900/80 hover:border-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-600 bg-slate-900/90 flex flex-col min-h-[420px] max-h-[min(70vh,640px)]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-800 text-slate-100 border border-slate-600'
                }`}
              >
                {m.imagePreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.imagePreview}
                    alt=""
                    className="max-h-40 rounded-xl mb-2 object-cover"
                  />
                )}
                {m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div className="text-sm text-violet-300 animate-pulse px-1">Trailhead is thinking…</div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-700 p-3 space-y-2">
          {imageDataUrl && (
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageDataUrl} alt="" className="h-14 w-14 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => setImageDataUrl(null)}
                className="text-slate-300 hover:text-white p-1"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void onPickImage(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="h-11 w-11 shrink-0 rounded-xl border border-slate-600 text-slate-200 hover:border-violet-500 flex items-center justify-center"
              title="Upload photo"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={2}
              placeholder={placeholder}
              className="flex-1 bg-slate-950 border border-slate-600 focus:border-violet-500 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none resize-none"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void send()}
              className="h-11 px-4 shrink-0 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          {!user && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Guest free tier works. Sign in so usage and AI Pro can follow your account.{' '}
              <button type="button" onClick={onRequestSignIn} className="text-violet-300 underline">
                Sign in
              </button>
            </p>
          )}
          <p className="text-[10px] text-slate-500 leading-relaxed">
            AI suggestions only — not a mechanic or guide service. Verify trail rules, fitment, and
            safety yourself. Gear &amp; parts only on Market (no whole vehicle sales).
          </p>
        </div>
      </div>
    </div>
  );
}
