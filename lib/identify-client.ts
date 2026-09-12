import type { GeneratedAd, Identification } from "@/lib/types";

export async function identifyPart(
  imageDataUrl: string,
): Promise<{ ok: true; identification: Identification } | { ok: false; error: string }> {
  const res = await fetch("/api/identify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageDataUrl }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    identification?: Identification;
    error?: string;
  };
  if (!res.ok || !data.identification) {
    return { ok: false, error: data.error || "Identify failed" };
  }
  return { ok: true, identification: data.identification };
}

export async function generateAd(payload: {
  identification: Identification;
  notes: string;
  edits?: {
    name?: string;
    category?: Identification["category"];
    raceSurface?: Identification["raceSurface"];
    fitment?: string;
    condition?: Identification["conditionGuess"];
    price?: number;
  };
}): Promise<{ ok: true; ad: GeneratedAd } | { ok: false; error: string }> {
  const res = await fetch("/api/generate-ad", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as { ad?: GeneratedAd; error?: string };
  if (!res.ok || !data.ad) {
    return { ok: false, error: data.error || "Could not write the listing" };
  }
  return { ok: true, ad: data.ad };
}
