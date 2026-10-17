"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/supabaseClient";
import { createListing, uploadListingImages, type MarketCondition } from "@/lib/marketListings";
import { loadAgentQueue, saveAgentQueue, type AgentDraft } from "@/lib/agent-queue";

type Ad = {
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  fitment: string;
  location?: string;
};

function splitPlace(location: string) {
  const [city, state] = location.split(",").map((part) => part.trim());
  return { city: city || "Syracuse", state: (state || "NY").slice(0, 2).toUpperCase() };
}

function asCondition(value: string): MarketCondition {
  if (value === "new" || value === "like-new" || value === "for-parts") return value;
  if (value === "fair") return "fair";
  return "good";
}

function dataUrlToFile(dataUrl: string) {
  const [head, body] = dataUrl.split(",");
  const mime = /data:(.*?);/.exec(head)?.[1] || "image/jpeg";
  const bin = atob(body || "");
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], "part.jpg", { type: mime });
}

export default function DeskPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [queue, setQueue] = useState<AgentDraft[]>([]);

  useEffect(() => {
    setQueue(loadAgentQueue());
    void supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      setUserId(data.session?.user.id ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
      setUserId(session?.user.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  function writeQueue(next: AgentDraft[]) {
    setQueue(next);
    saveAgentQueue(next);
  }

  async function runLister() {
    if (!userId) {
      toast.error("Sign in first. The Lister will not run for a guest.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/agent/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, imageDataUrl }),
      });
      const body = (await res.json()) as { error?: string; ad?: Ad };
      if (!res.ok || !body.ad) throw new Error(body.error || "The Lister failed");
      const ad = body.ad;
      const draft: AgentDraft = {
        id: crypto.randomUUID(),
        title: ad.title,
        description: ad.description,
        price: ad.price,
        condition: ad.condition,
        category: ad.category,
        fitment: ad.fitment,
        location: ad.location || "Syracuse, NY",
        imageDataUrl,
        createdAt: new Date().toISOString(),
      };
      writeQueue([draft, ...loadAgentQueue()]);
      setNotes("");
      setImageDataUrl("");
      toast.success("Draft is waiting for your OK.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The Lister failed");
    } finally {
      setBusy(false);
    }
  }

  function patch(id: string, next: Partial<AgentDraft>) {
    writeQueue(queue.map((row) => (row.id === id ? { ...row, ...next } : row)));
  }

  async function approve(row: AgentDraft) {
    if (!userId) {
      toast.error("Sign in first.");
      return;
    }
    setBusy(true);
    try {
      let images: string[] = [];
      if (row.imageDataUrl.startsWith("data:image/")) {
        const uploaded = await uploadListingImages(userId, [dataUrlToFile(row.imageDataUrl)]);
        images = uploaded.urls;
      }
      const place = splitPlace(row.location);
      const posted = await createListing(userId, {
        kind: "parts",
        title: row.title,
        description: row.description,
        price: Number(row.price) || 0,
        condition: asCondition(row.condition),
        city: place.city,
        state: place.state,
        category: row.category || "other",
        images,
        contact_email: email,
      });
      if (posted.error || !posted.listing) throw new Error(posted.error || "Could not post");
      writeQueue(loadAgentQueue().filter((item) => item.id !== row.id));
      toast.success("Approved. It is on the board.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-xl space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Desk</p>
        <h1 className="font-display text-4xl font-semibold leading-none">Lister</h1>
        <p className="text-sm text-muted">
          {email
            ? `Signed in as ${email}. Nothing posts until you tap Approve.`
            : "Sign in at the top. The Lister will not post for a guest."}
        </p>

        <div className="rv-glass space-y-3 rounded-3xl p-5">
          <label className="block text-sm font-semibold">
            Photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="mt-2 block w-full text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setImageDataUrl(String(reader.result || ""));
                reader.readAsDataURL(file);
              }}
            />
          </label>
          {imageDataUrl ? (
            <img src={imageDataUrl} alt="" className="h-40 w-full rounded-2xl object-cover" />
          ) : null}
          <label className="block text-sm font-semibold">
            Or say what it is
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Used clutch for a 2020 YZ450, asking 180, pickup Syracuse"
              className="mt-2 w-full rounded-2xl border border-border bg-bg/60 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runLister()}
            className="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-fg disabled:opacity-60"
          >
            {busy ? "Working…" : "Run the Lister"}
          </button>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-2xl font-semibold">Waiting for your OK</h2>
          {queue.length === 0 ? (
            <p className="text-sm text-muted">Nothing waiting.</p>
          ) : (
            queue.map((row) => (
              <article key={row.id} className="rv-glass space-y-3 rounded-3xl p-5">
                {row.imageDataUrl ? (
                  <img src={row.imageDataUrl} alt="" className="h-36 w-full rounded-2xl object-cover" />
                ) : null}
                <input
                  value={row.title}
                  onChange={(event) => patch(row.id, { title: event.target.value })}
                  className="w-full bg-transparent font-display text-2xl font-semibold outline-none"
                />
                <p className="text-sm text-muted">{row.description}</p>
                <p className="text-xs uppercase tracking-wide text-muted">
                  {row.category}
                  {row.fitment ? ` · ${row.fitment}` : ""}
                </p>
                <label className="block text-sm font-semibold">
                  Price
                  <input
                    type="number"
                    value={row.price}
                    onChange={(event) => patch(row.id, { price: Number(event.target.value) })}
                    className="mt-1 w-full rounded-2xl border border-border bg-bg/60 px-3 py-2"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void approve(row)}
                    className="h-10 flex-1 rounded-full bg-primary text-sm font-semibold text-primary-fg disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => writeQueue(queue.filter((item) => item.id !== row.id))}
                    className="h-10 flex-1 rounded-full border border-border text-sm font-semibold"
                  >
                    Deny
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}
