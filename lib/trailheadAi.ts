export type TrailheadMode = 'parts' | 'trip' | 'checklist' | 'listing' | 'general';

export const TRAILHEAD_MODES: {
  id: TrailheadMode;
  label: string;
  short: string;
  placeholder: string;
}[] = [
  {
    id: 'parts',
    label: 'Parts ID',
    short: 'Photo or describe a part',
    placeholder: 'Describe the part, or upload a photo…',
  },
  {
    id: 'trip',
    label: 'Trip / trail',
    short: 'RV, ATV, snow, dirt, overland',
    placeholder: 'Where, when, and which recreational vehicle(s)?',
  },
  {
    id: 'checklist',
    label: 'Pre-ride / pre-tow',
    short: 'Get ready before you leave',
    placeholder: 'Vehicle type and trip length…',
  },
  {
    id: 'listing',
    label: 'Listing coach',
    short: 'Sell gear faster',
    placeholder: 'Describe what you’re selling (or attach a photo)…',
  },
  {
    id: 'general',
    label: 'Ask anything',
    short: 'Road + trail life',
    placeholder: 'Ask about gear, trips, or recreational vehicles…',
  },
];

export const FREE_AI_MESSAGES_PER_DAY = 1;

export const TRAILHEAD_SYSTEM = `You are Trailhead AI on rvchain (rv-chain.com) — the co-pilot for recreational vehicle life.

Scope: street RVs and campers, overland trucks, ATVs/UTVs, dirt bikes, snowmobiles, trailers, and related gear/parts. Family road life and off-road adventure.

Brand: RV Chain is NOT a campground directory, NOT a vehicle dealer, and does NOT sell whole vehicles or take escrow. Users buy/sell gear and parts privately on the Market; they contact sellers themselves.

Rules:
- Be practical, concise, and safety-minded.
- Always note that advice is educational only — not a mechanic, guide service, or lawyer. User must verify fitment, trail rules, weather, and safety.
- Prefer generic part *types* over inventing exact OEM part numbers or brand claims you are unsure of.
- When gear/parts shopping fits, suggest they browse rvchain Market (gear & parts board).
- Do not invent real campground inventories, prices, or "guaranteed open" trails.
- Support all recreational vehicle types equally (road + powersports).

Response style: short paragraphs or clear bullets. End with 1–2 concrete next steps when helpful.`;

export function modeInstruction(mode: TrailheadMode): string {
  switch (mode) {
    case 'parts':
      return 'Mode: PARTS ID. Identify likely part category from description or image. List what to measure/check. Suggest Market search keywords. Never guarantee fitment.';
    case 'trip':
      return 'Mode: TRIP/TRAIL PLAN. Ask only if critical info missing. Produce a practical plan: packing, vehicle readiness, weather/skill caveats. Cover RV/road and/or ATV/snow/dirt/overland as relevant.';
    case 'checklist':
      return 'Mode: PRE-RIDE / PRE-TOW CHECKLIST. Output a prioritized checklist for the vehicle type(s) mentioned. Include safety and "don\'t leave without" items.';
    case 'listing':
      return 'Mode: LISTING COACH. Help write a clear private-party gear/parts listing: title options, description, condition language, price band if possible, photo tips. No whole-vehicle sales coaching as a dealer.';
    default:
      return 'Mode: GENERAL. Answer recreational vehicle lifestyle questions; steer to the right mode if they need a plan, checklist, part ID, or listing help.';
  }
}

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};
