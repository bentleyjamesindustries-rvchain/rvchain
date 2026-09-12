export const CATEGORIES = ["atv", "truck", "dirtbike", "racecar", "snowmobile"] as const;
export type Category = (typeof CATEGORIES)[number];

export const MAIN_CATEGORIES = ["atv", "truck", "dirtbike", "racecar", "snowmobile"] as const;
export type MainCategory = (typeof MAIN_CATEGORIES)[number];

export const RACE_SURFACES = ["dirt", "asphalt", "offroad"] as const;
export type RaceSurface = (typeof RACE_SURFACES)[number];

export const CONDITIONS = ["new", "like-new", "used", "for-parts"] as const;
export type Condition = (typeof CONDITIONS)[number];

export type Identification = {
  name: string;
  summary: string;
  category: Category | "unknown";
  raceSurface: RaceSurface | null;
  partType: string;
  fitment: string;
  likelyFits: string[];
  conditionGuess: Condition;
  estimatedLow: number;
  estimatedHigh: number;
  confidence: number;
  identifiers: string[];
  tags: string[];
};

export type GeneratedAd = {
  title: string;
  description: string;
  price: number;
  condition: Condition;
  location: string;
  tags: string[];
  highlights: string[];
  category: Category;
  raceSurface: RaceSurface | null;
  partType: string;
  fitment: string;
};

export type Listing = {
  id: string;
  source: "catalog" | "mine";
  title: string;
  description: string;
  category: Category;
  raceSurface: RaceSurface | null;
  partType: string;
  fitment: string;
  condition: Condition;
  price: number;
  location: string;
  photo: string;
  tags: string[];
  highlights: string[];
  createdAt: number;
};

export const CATEGORY_LABEL: Record<Category, string> = {
  atv: "ATV",
  truck: "Truck",
  dirtbike: "Dirt bike",
  racecar: "Racecar",
  snowmobile: "Snowmobile",
};

export const RACE_SURFACE_LABEL: Record<RaceSurface, string> = {
  dirt: "Dirt",
  asphalt: "Asphalt",
  offroad: "Offroad",
};

export const MAIN_TILES: { id: MainCategory; src: string; label: string }[] = [
  { id: "atv", src: "/cats/atv.jpg", label: "ATV" },
  { id: "truck", src: "/cats/truck.jpg", label: "Truck" },
  { id: "dirtbike", src: "/cats/dirtbike.jpg", label: "Dirt bike" },
  { id: "racecar", src: "/cats/racecar.jpg", label: "Racecar" },
  { id: "snowmobile", src: "/cats/snow.jpg", label: "Snowmobile" },
];

export const RACE_TILES: { id: RaceSurface; src: string; label: string }[] = [
  { id: "dirt", src: "/cats/dirt.jpg", label: "Dirt" },
  { id: "asphalt", src: "/cats/asphalt.jpg", label: "Asphalt" },
  { id: "offroad", src: "/cats/offroad.jpg", label: "Offroad" },
];

export const CONDITION_LABEL: Record<Condition, string> = {
  new: "New",
  "like-new": "Like new",
  used: "Used",
  "for-parts": "For parts",
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function isRaceSurface(value: string): value is RaceSurface {
  return (RACE_SURFACES as readonly string[]).includes(value);
}

export function listingKindLabel(listing: Pick<Listing, "category" | "raceSurface">) {
  if (listing.category === "racecar" && listing.raceSurface) {
    return `${CATEGORY_LABEL.racecar} · ${RACE_SURFACE_LABEL[listing.raceSurface]}`;
  }
  return CATEGORY_LABEL[listing.category] ?? "Part";
}

export function inferCategory(
  category: Category | "unknown",
  ...bits: string[]
): Category | "unknown" {
  if (category !== "unknown") return category;
  const s = bits.join(" ").toLowerCase();
  if (
    /\b(racecar|race\s*car|sprint\s*car|late\s*model|stock\s*car|nascar|imsa|formula|dirt\s*oval|asphalt\s*oval|beadlock|winged\s*sprint|trophy\s*truck|ultra\s*4)\b/.test(
      s,
    )
  ) {
    return "racecar";
  }
  if (/\b(snowmobile|sled|ski-doo|polaris 600|track ski)\b/.test(s)) return "snowmobile";
  if (/\b(atv|quad|utv|sportsman|grizzly|outlander|rancher)\b/.test(s)) return "atv";
  if (/\b(dirt\s*bike|dirtbike|motocross|\bmx\b|crf|yz\d|kx\d)\b/.test(s)) return "dirtbike";
  if (/\b(truck|jeep|tacoma|4runner|pickup|skid|4x4)\b/.test(s)) return "truck";
  return "unknown";
}

export function inferRaceSurface(
  category: Category | "unknown",
  ...bits: string[]
): RaceSurface | null {
  if (category !== "racecar" && category !== "unknown") return null;
  const s = bits.join(" ").toLowerCase();
  if (/\b(off[- ]?road|trophy\s*truck|baja|ultra\s*4|desert\s*race|prerunner|king\s*of\s*the\s*hammers)\b/.test(s))
    return "offroad";
  if (/\b(asphalt|pavement|paved|road\s*course|slick|street\s*stock)\b/.test(s)) return "asphalt";
  if (/\b(dirt\s*oval|clay|sprint\s*car|beadlock|dirt\s*late|winged)\b/.test(s)) return "dirt";
  if (category === "racecar") {
    if (/\boff[- ]?road\b/.test(s)) return "offroad";
    if (/\basphalt\b/.test(s)) return "asphalt";
    if (/\bdirt\b/.test(s)) return "dirt";
  }
  return null;
}
