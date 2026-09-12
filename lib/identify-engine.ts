import { z } from "zod";
import { parseJsonObject } from "./utils";
import {
  CONDITIONS,
  type Category,
  type Condition,
  type GeneratedAd,
  type Identification,
  type RaceSurface,
} from "./types";

const IdentifyInput = z.object({
  imageDataUrl: z.string().min(32).max(2_800_000),
});

const GenerateInput = z.object({
  identification: z.object({
    name: z.string(),
    summary: z.string(),
    category: z.enum(["atv", "dirtbike", "truck", "racecar", "snowmobile", "unknown"]),
    raceSurface: z.enum(["dirt", "asphalt", "offroad"]).nullable(),
    partType: z.string(),
    fitment: z.string(),
    likelyFits: z.array(z.string()),
    conditionGuess: z.enum(CONDITIONS),
    estimatedLow: z.number(),
    estimatedHigh: z.number(),
    confidence: z.number(),
    identifiers: z.array(z.string()),
    tags: z.array(z.string()),
  }),
  notes: z.string().max(4000),
  edits: z
    .object({
      name: z.string().optional(),
      category: z.enum(["atv", "dirtbike", "truck", "racecar", "snowmobile", "unknown"]).optional(),
      raceSurface: z.enum(["dirt", "asphalt", "offroad"]).nullable().optional(),
      fitment: z.string().optional(),
      condition: z.enum(CONDITIONS).optional(),
      price: z.number().optional(),
    })
    .optional(),
});

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map((v) => String(v)).join(", ");
  if (typeof value === "number") return String(value);
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,;|/]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

function coerceCategory(raw: unknown, extra = ""): Category | "unknown" {
  const s = `${asString(raw)} ${extra}`.toLowerCase();
  if (
    /\b(racecar|race\s*car|sprint\s*car|late\s*model|stock\s*car|nascar|imsa|formula|dirt\s*oval|asphalt\s*oval|beadlock|winged\s*sprint|trophy\s*truck|ultra\s*4)\b/.test(
      s,
    )
  ) {
    return "racecar";
  }
  if (/\b(snowmobile|sled|ski-doo|carbide|snow ski)\b/.test(s)) return "snowmobile";
  if (/\b(atv|quad|fourtrax|sportsman|grizzly|outlander|rancher|utv)\b/.test(s)) return "atv";
  if (/\b(dirt\s*bike|dirtbike|motocross|mx\b|crf|yz\d|kx\d|450f|250f|sprocket|swingarm)\b/.test(s))
    return "dirtbike";
  if (/\b(truck|jeep|tacoma|4runner|f-?150|raptor|skid|bumper|pickup|4x4)\b/.test(s)) return "truck";
  if (s.includes("snow")) return "snowmobile";
  if (s.includes("atv")) return "atv";
  if (s.includes("race")) return "racecar";
  if (s.includes("dirt")) return "dirtbike";
  if (s.includes("truck")) return "truck";
  return "unknown";
}

function coerceRaceSurface(category: Category | "unknown", raw: unknown, extra = ""): RaceSurface | null {
  if (category !== "racecar" && category !== "unknown") return null;
  const s = `${asString(raw)} ${extra}`.toLowerCase();
  if (/\b(off[- ]?road|trophy\s*truck|baja|ultra\s*4|desert\s*race|prerunner)\b/.test(s)) return "offroad";
  if (/\b(asphalt|pavement|paved|road\s*course|slick|street\s*stock)\b/.test(s)) return "asphalt";
  if (/\b(dirt\s*oval|clay|sprint\s*car|beadlock|dirt\s*late|winged)\b/.test(s)) return "dirt";
  if (s.includes("asphalt")) return "asphalt";
  if (s.includes("offroad") || s.includes("off-road")) return "offroad";
  if (s.includes("dirt")) return "dirt";
  return null;
}

function coerceCondition(raw: unknown): Condition {
  const s = asString(raw).toLowerCase();
  if (s.includes("for-parts") || s.includes("for parts") || s.includes("core")) return "for-parts";
  if (s.includes("like-new") || s.includes("like new") || s.includes("excellent")) return "like-new";
  if (/\bnew\b/.test(s) && !s.includes("used")) return "new";
  return "used";
}

function toIdentification(raw: unknown): Identification {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const name = asString(obj.name, "Unknown part");
  const summary = asString(obj.summary, "Could not fully identify this part from the photo.");
  const extra = [name, summary, asString(obj.partType), asString(obj.fitment), ...asStringArray(obj.tags)].join(
    " ",
  );
  const low = asNumber(obj.estimatedLow ?? obj.estimated_low);
  const high = asNumber(obj.estimatedHigh ?? obj.estimated_high, low);
  const confidence = Math.min(1, Math.max(0, asNumber(obj.confidence, 0.5)));
  const category = coerceCategory(obj.category, extra);
  return {
    name: name.slice(0, 80),
    summary,
    category,
    raceSurface: coerceRaceSurface(category, obj.raceSurface ?? obj.race_surface, extra),
    partType: asString(obj.partType ?? obj.part_type, "Part"),
    fitment: asString(obj.fitment, "Verify fitment"),
    likelyFits: asStringArray(obj.likelyFits ?? obj.likely_fits),
    conditionGuess: coerceCondition(obj.conditionGuess ?? obj.condition),
    estimatedLow: Math.max(0, Math.round(low)),
    estimatedHigh: Math.max(0, Math.round(Math.max(low, high))),
    confidence,
    identifiers: asStringArray(obj.identifiers),
    tags: asStringArray(obj.tags).map((t) => t.toLowerCase()),
  };
}

function toAd(raw: unknown, fallback: Identification, notes = ""): GeneratedAd {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const extra = [asString(obj.title), asString(obj.description), fallback.name, fallback.partType, notes].join(
    " ",
  );
  const category = coerceCategory(obj.category ?? fallback.category, extra);
  const parsed = parseSellerNotes(notes);
  const modelFitment = asString(obj.fitment, fallback.fitment);
  let fitment = modelFitment;
  if (parsed.fitment) {
    const lower = modelFitment.toLowerCase();
    const missing = parsed.fitment.split(/\s+/).filter((bit) => bit && !lower.includes(bit.toLowerCase()));
    if (missing.length) {
      fitment = modelFitment ? `${parsed.fitment} · ${modelFitment}` : parsed.fitment;
    }
  }
  const resolvedCat: Category = category === "unknown" ? "atv" : category;
  return {
    title: asString(obj.title, fallback.name).slice(0, 90),
    description: asString(obj.description, fallback.summary),
    price: Math.max(
      0,
      Math.round(asNumber(parsed.price ?? obj.price, fallback.estimatedHigh || fallback.estimatedLow)),
    ),
    condition: parsed.condition ?? coerceCondition(obj.condition ?? fallback.conditionGuess),
    location: parsed.location || asString(obj.location),
    tags: asStringArray(obj.tags).map((t) => t.toLowerCase()),
    highlights: asStringArray(obj.highlights).slice(0, 5),
    category: resolvedCat,
    raceSurface:
      resolvedCat === "racecar"
        ? coerceRaceSurface(resolvedCat, obj.raceSurface ?? obj.race_surface, extra) ?? fallback.raceSurface
        : null,
    partType: asString(obj.partType, fallback.partType),
    fitment,
  };
}

function parseSellerNotes(notes: string): {
  price?: number;
  location?: string;
  condition?: Condition;
  fitment?: string;
} {
  const text = notes.trim();
  if (!text) return {};
  const out: { price?: number; location?: string; condition?: Condition; fitment?: string } = {};

  const ask = text.match(
    /(?:asking|ask(?:ing)?\s*(?:price)?|price|obo|listed\s+at|i want)\s*\$?\s*(\d{1,5})(?:\.\d{2})?\b/i,
  );
  const dollar = text.match(/\$\s*(\d{1,5})(?:\.\d{2})?\b/);
  const rawPrice = Number((ask?.[1] ?? dollar?.[1] ?? "").replace(/[^\d]/g, ""));
  if (rawPrice >= 5 && rawPrice <= 20000 && (rawPrice < 1900 || rawPrice > 2035)) {
    out.price = rawPrice;
  }

  const pickup = text.match(
    /(?:pick\s*up|pickup|located|location)(?:\s+(?:in|at))?\s+([A-Za-z][A-Za-z.'-]+(?:\s+[A-Za-z][A-Za-z.'-]+)?)(?:,?\s*([A-Za-z]{2}))?/i,
  );
  if (pickup?.[1] && !/^(the|a|an|my|this|used|new|good|great)$/i.test(pickup[1])) {
    const city = pickup[1].replace(/\b\w/g, (c) => c.toUpperCase());
    const st = pickup[2] ? pickup[2].toUpperCase() : "";
    out.location = st ? `${city}, ${st}` : city;
  }

  const lower = text.toLowerCase();
  if (/\b(for\s*parts|core|part\s*out)\b/.test(lower)) out.condition = "for-parts";
  else if (/\b(brand\s*new|never\s*used|still\s*in\s*(the\s*)?box)\b/.test(lower)) out.condition = "new";
  else if (/\b(like\s*new|excellent|barely\s*used)\b/.test(lower)) out.condition = "like-new";
  else if (/\bused\b/.test(lower)) out.condition = "used";

  const year = text.match(/\b(19[89]\d|20[0-2]\d)\b/);
  const brand = text.match(
    /\b(honda|yamaha|kawasaki|suzuki|polaris|can-?am|brp|ski-?doo|arctic cat|lynx|cfmoto|kymco|jeep|toyota|ford|chevy|chevrolet|gmc|ram|sportsman|grizzly|rancher|outlander|fourtrax|tacoma|4runner|crf|yz|kx|rmz)\b/i,
  );
  if (year || brand) {
    out.fitment = [year?.[1], brand?.[1]].filter(Boolean).join(" ");
  }
  return out;
}

async function callGrok(messages: unknown[], maxTokens: number) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false as const, error: "AI is not available in this environment" };

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.XAI_MODEL ?? "grok-4.5",
      messages,
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return {
      ok: false as const,
      error: `xAI API error ${res.status}${detail ? `: ${detail.slice(0, 180)}` : ""}`,
    };
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content ?? "";
  if (!text) return { ok: false as const, error: "Empty response from Grok" };
  return { ok: true as const, text };
}

const IDENTIFY_SYSTEM = `You are the Identify engine for RV Chain, a powersports parts board.
Identify parts for ATVs, UTVs, off-road trucks, dirt bikes, snowmobiles, and racecars (dirt oval, asphalt, and offroad).
Look at the photo and identify the part. Be specific and practical — a wrench-turner listing this on a private-party board.
If it is not a powersports part, still describe it and set category to "unknown". Never classify campers, trailers, or campground gear as a fit — use "unknown".
Return ONLY compact JSON. category MUST be exactly one of: "atv", "dirtbike", "truck", "racecar", "snowmobile", "unknown".
If category is "racecar", raceSurface MUST be exactly "dirt", "asphalt", or "offroad". Otherwise raceSurface MUST be null.
conditionGuess MUST be exactly one of: "new", "like-new", "used", "for-parts".
likelyFits, identifiers, and tags MUST be arrays of strings.
{
  "name": "short part name",
  "summary": "2-4 sentence plain-English summary of what it is, condition clues in the photo, and what it likely bolts to",
  "category": "atv",
  "raceSurface": null,
  "partType": "e.g. swingarm, CVT belt, beadlock wheel, ski",
  "fitment": "best-guess make/model/years or Universal",
  "likelyFits": ["string"],
  "conditionGuess": "used",
  "estimatedLow": 80,
  "estimatedHigh": 140,
  "confidence": 0.82,
  "identifiers": ["any visible OEM or size markings"],
  "tags": ["lowercase search tags"]
}`;

const AD_SYSTEM = `You write classified listings for RV Chain Market. Powersports gear and parts only — ATV, truck, dirt bike, snowmobile, racecar. Never whole vehicles. Never campers or camping gear. Voice: a competent rider or racer, not a dealership. Short sentences. No emoji. No hype.

The seller's VOICE DESCRIPTION is GROUND TRUTH. It is often messy speech-to-text (wrong spaces, homophones like "clay" vs "Clay", "eighty five" vs 85, "sports man" vs Sportsman). Decode their intent. Do not invent facts they did not say.

Priority: (1) voice/typed description (2) seller field edits (3) photo ID guesses.
If (1) names a year, brand, model, hours, defect, asking price, or pickup town, those MUST appear in title, fitment, price, location, and description. Never replace a spoken model with a different photo guess.
If no price was spoken, use the photo estimate. If no town was spoken, leave location empty.

Return ONLY compact JSON. category MUST be exactly "atv", "dirtbike", "truck", "racecar", or "snowmobile".
If category is "racecar", raceSurface MUST be "dirt", "asphalt", or "offroad". Otherwise raceSurface MUST be null.
condition MUST be exactly "new", "like-new", "used", or "for-parts".
tags and highlights MUST be arrays of strings.
{
  "title": "marketplace title, max 70 chars, include spoken year/model if given",
  "description": "120-180 words, grounded in the voice description",
  "price": 89,
  "condition": "used",
  "location": "city, ST if spoken, else empty string",
  "tags": ["lowercase"],
  "highlights": ["3 short bullets taken from what they said"],
  "category": "atv",
  "raceSurface": null,
  "partType": "string",
  "fitment": "string"
}`;

export async function runIdentifyPart(
  input: unknown,
): Promise<{ ok: true; identification: Identification } | { ok: false; error: string }> {
  const data = IdentifyInput.parse(input);
  if (!data.imageDataUrl.startsWith('data:image/')) {
    return { ok: false, error: 'Send a JPEG or PNG photo' };
  }

  const result = await callGrok(
    [
      { role: 'system', content: IDENTIFY_SYSTEM },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: data.imageDataUrl, detail: 'high' } },
          {
            type: 'text',
            text: 'Identify this powersports part. JSON only. category must be atv, dirtbike, truck, racecar, snowmobile, or unknown. If racecar, raceSurface must be dirt, asphalt, or offroad. Not campers.',
          },
        ],
      },
    ],
    900,
  );

  if (!result.ok) return result;
  try {
    return { ok: true, identification: toIdentification(parseJsonObject(result.text)) };
  } catch {
    return { ok: false, error: 'Could not read that photo. Try a closer shot of the part.' };
  }
}

export async function runGenerateAd(
  input: unknown,
): Promise<{ ok: true; ad: GeneratedAd } | { ok: false; error: string }> {
  const data = GenerateInput.parse(input);
  const payload = {
    identification: data.identification,
    sellerEdits: data.edits ?? {},
    voiceDescription: data.notes,
  };

  const result = await callGrok(
    [
      { role: 'system', content: AD_SYSTEM },
      {
        role: "user",
        content:
          "Write the listing. Voice description is source of truth (messy speech-to-text is likely).\nVOICE:\n" +
          (data.notes || "(none)") +
          "\n\nPHOTO ID + EDITS:\n" +
          JSON.stringify(payload),
      },
    ],
    900,
  );

  if (!result.ok) return result;
  try {
    const parsed = toAd(parseJsonObject(result.text), data.identification, data.notes);
    if (data.edits?.price && data.edits.price > 0) {
      parsed.price = Math.round(data.edits.price);
    }
    if (!parsed.title || parsed.description.length < 12) {
      return { ok: false, error: 'Could not write the listing. Add a bit more detail and try again.' };
    }
    return { ok: true, ad: parsed };
  } catch {
    return { ok: false, error: 'Could not write the listing. Add a bit more detail and try again.' };
  }
}
