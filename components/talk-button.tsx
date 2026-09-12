'use client';

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { t } from "@/lib/copy";
import { useRvStore } from "@/lib/rv-store";
import { cn } from "@/lib/utils";

type Alt = { transcript: string; confidence?: number };

type SpeechResult = ArrayLike<Alt> & {
  isFinal: boolean;
  length: number;
};

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: { resultIndex: number; results: ArrayLike<SpeechResult> & { length: number } }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

function getSpeechCtor(): (new () => SpeechRec) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function joinText(...parts: string[]) {
  return parts
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" ");
}

function bestTranscript(row: SpeechResult): string {
  let best = row[0];
  for (let i = 1; i < row.length; i += 1) {
    if ((row[i]?.confidence ?? 0) > (best?.confidence ?? 0)) best = row[i];
  }
  return (best?.transcript ?? "").trim();
}

export function TalkButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const locale = useRvStore((s) => s.locale);
  const copy = t(locale).talk;
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [hint, setHint] = useState("");
  const recRef = useRef<SpeechRec | null>(null);
  const wantRef = useRef(false);
  const committedRef = useRef(value);
  const sessionFinalRef = useRef("");

  useEffect(() => {
    setSupported(Boolean(getSpeechCtor()));
  }, []);

  useEffect(() => {
    if (!listening) committedRef.current = value;
  }, [value, listening]);

  useEffect(() => {
    return () => {
      wantRef.current = false;
      recRef.current?.abort();
    };
  }, []);

  function startSession() {
    const Ctor = getSpeechCtor();
    if (!Ctor) return;
    recRef.current?.abort();
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.lang = locale === "es" ? "es-US" : "en-US";
    sessionFinalRef.current = "";

    rec.onresult = (ev) => {
      let sessionFinal = "";
      let interim = "";
      for (let i = 0; i < ev.results.length; i += 1) {
        const row = ev.results[i];
        const text = bestTranscript(row);
        if (!text) continue;
        if (row.isFinal) sessionFinal = joinText(sessionFinal, text);
        else interim = joinText(interim, text);
      }
      sessionFinalRef.current = sessionFinal;
      onChange(joinText(committedRef.current, sessionFinal, interim));
    };

    rec.onerror = (ev) => {
      if (ev.error === "not-allowed") {
        wantRef.current = false;
        setHint(copy.blocked);
        setListening(false);
      } else if (ev.error === "no-speech") {
        setHint(copy.noSpeech);
      } else if (ev.error !== "aborted") {
        wantRef.current = false;
        setHint(copy.couldntHear);
        setListening(false);
      }
    };

    rec.onend = () => {
      committedRef.current = joinText(committedRef.current, sessionFinalRef.current);
      sessionFinalRef.current = "";
      onChange(committedRef.current);
      recRef.current = null;
      if (!wantRef.current) {
        setListening(false);
        return;
      }
      window.setTimeout(() => {
        if (!wantRef.current) {
          setListening(false);
          return;
        }
        try {
          startSession();
        } catch {
          wantRef.current = false;
          setListening(false);
          setHint(copy.paused);
        }
      }, 220);
    };

    recRef.current = rec;
    rec.start();
  }

  function toggle() {
    const Ctor = getSpeechCtor();
    if (!Ctor) {
      setSupported(false);
      setHint(copy.notAvailable);
      return;
    }

    if (listening) {
      wantRef.current = false;
      recRef.current?.stop();
      setListening(false);
      setHint(copy.checkTranscript);
      return;
    }

    committedRef.current = value.trim();
    sessionFinalRef.current = "";
    wantRef.current = true;
    try {
      startSession();
      setListening(true);
      setHint(copy.speakHint);
    } catch {
      wantRef.current = false;
      setHint(copy.couldntStart);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={listening}
        className={cn(
          "relative grid size-24 place-items-center rounded-full transition-[transform,background-color] duration-150 ease-out active:scale-[0.96]",
          listening ? "bg-danger text-fg" : "bg-primary text-primary-fg",
        )}
      >
        {listening ? (
          <>
            <span className="talk-ring pointer-events-none absolute inset-0 rounded-full bg-danger/40" />
            <Square className="relative size-7 fill-current" />
          </>
        ) : (
          <Mic className="size-9" />
        )}
        <span className="sr-only">{listening ? copy.stop : copy.start}</span>
      </button>
      <p className="font-display text-xl font-semibold tracking-wide">
        {listening ? copy.listening : copy.voice}
      </p>
      <p className="max-w-sm text-center text-sm text-muted">
        {hint || (supported ? copy.defaultHint : copy.unsupported)}
      </p>
    </div>
  );
}