import { NextResponse } from "next/server";
import { runGenerateAd, runIdentifyPart } from "@/lib/identify-engine";
import type { Identification } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function draftFromWords(notes: string): Identification {
  const name = notes.split(/[.\n]/)[0]?.trim().slice(0, 80) || "Powersports part";
  return {
    name,
    summary: notes.slice(0, 400),
    category: "unknown",
    raceSurface: null,
    partType: "Part",
    fitment: "Verify fitment",
    likelyFits: [],
    conditionGuess: "used",
    estimatedLow: 0,
    estimatedHigh: 0,
    confidence: 0.4,
    identifiers: [],
    tags: [],
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { imageDataUrl?: string; notes?: string };
    const notes = String(body.notes ?? "").trim();
    const image = String(body.imageDataUrl ?? "");

    let identification: Identification;
    if (image.startsWith("data:image/")) {
      const seen = await runIdentifyPart({ imageDataUrl: image });
      if (!seen.ok) return NextResponse.json({ error: seen.error }, { status: 400 });
      identification = seen.identification;
    } else if (notes) {
      identification = draftFromWords(notes);
    } else {
      return NextResponse.json({ error: "Add a photo or a sentence." }, { status: 400 });
    }

    const written = await runGenerateAd({
      identification,
      notes: notes || identification.summary,
    });
    if (!written.ok) return NextResponse.json({ error: written.error }, { status: 400 });

    return NextResponse.json({ identification, ad: written.ad });
  } catch (err) {
    const message = err instanceof Error ? err.message : "The Lister failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
