'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles, Send, ImagePlus, X, Lock, Mountain, Wrench, Map, ClipboardList, Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import {
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
import { useI18n } from '@/lib/i18n/context';

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

const MODE_LABEL_KEYS: Record<TrailheadMode, { label: string; ph: string }> = {
  parts: { label: 'ai.modeParts', ph: 'ai.modePartsPh' },
  trip: { label: 'ai.modeTrip', ph: 'ai.modeTripPh' },
  checklist: { label: 'ai.modeCheck', ph: 'ai.modeCheckPh' },
  listing: { label: 'ai.modeList', ph: 'ai.modeListPh' },
  general: { label: 'ai.modeGen', ph: 'ai.modeGenPh' },
};

export default function TrailheadAI({ user, onRequestSignIn, onGoMarket }: Props) {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<TrailheadMode>('general');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [aiPro, setAiPro] = useState(false);
  const [usage, setUsage] = useState(() => getAiUsageToday(user?.id));
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const seededRef = useRef(false);

  useEffect(() => {
    if (!seededRef.current) {
      setMessages([{ role: 'assistant', content: t('ai.welcome') }]);
      seededRef.current = true;
      return;
    }
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ role: 'assistant', content: t('ai.welcome') }];
      }
      return prev;
    });
  }, [locale, t]);

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

  const modes = useMemo(
    () =>
      (Object.keys(MODE_LABEL_KEYS) as TrailheadMode[]).map((id) => ({
        id,
        label: t(MODE_LABEL_KEYS[id].label),
        placeholder: t(MODE_LABEL_KEYS[id].ph),
      })),
    [t]
  );

  const onPickImage = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 1280, 0.8, 800_000);
      setImageDataUrl(dataUrl);
      if (mode === 'general') setMode('parts');
    } catch {
      toast.error(t('ai.imageFail'));
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text && !imageDataUrl) return;

    if (!aiPro && !canSendFreeMessage(user?.id)) {
      toast.error(t('ai.limitToast', { n: FREE_AI_MESSAGES_PER_DAY }));
      return;
    }

    const userMsg: Msg = {
      role: 'user',
      content: text || t('ai.imageAsk'),
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
          locale,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        if (data.code === 'LIMIT') {
          toast.error(data.error || t('ai.dailyLimit'));
        } else {
          toast.error(data.error || t('ai.unavailable'));
        }
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            content: data.error || t('ai.errorReply'),
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
      toast.error(t('ai.network'));
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: t('ai.networkReply') },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const placeholder = modes.find((m) => m.id === mode)?.placeholder || t('ai.modeGenPh');

  return (
    <div className="max-w-screen-lg mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-4 pb-8">
      <div className="rounded-3xl border border-violet-600/40 bg-gradient-to-br from-violet-950 via-slate-900 to-amber-950/40 p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-violet-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-violet-300 text-xs font-bold uppercase tracking-[0.15em]">
              {t('ai.eyebrow')}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {t('ai.tagline')}
            </h2>
            <p className="text-sm text-slate-200 mt-2 leading-relaxed max-w-2xl">{t('ai.blurb')}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          {aiPro ? (
            <span className="px-3 py-1.5 rounded-full bg-violet-500/30 text-violet-100 border border-violet-400/40">
              {t('ai.proBadge')}
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-200 border border-slate-600">
              {t('ai.freeBadge', { remaining: usage.remaining, limit: usage.limit })}
            </span>
          )}
          <button
            type="button"
            onClick={onGoMarket}
            className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-100 border border-amber-500/40 hover:bg-amber-500/30"
          >
            {t('ai.browseMarket')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {modes.map((m) => {
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
            <div className="text-sm text-violet-300 animate-pulse px-1">{t('ai.thinking')}</div>
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
                aria-label={t('ai.removePhoto')}
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
              title={t('ai.attach')}
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
              {t('ai.send')}
            </button>
          </div>
          {!user && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1 flex-wrap">
              <Lock className="w-3 h-3" />
              <button type="button" onClick={onRequestSignIn} className="text-violet-300 underline">
                {t('header.signIn')}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
