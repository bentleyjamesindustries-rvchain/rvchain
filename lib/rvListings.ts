export type RvClass =
  | 'class-a'
  | 'class-b'
  | 'class-c'
  | 'travel-trailer'
  | 'fifth-wheel'
  | 'truck-camper'
  | 'popup';

export type RvCondition = 'new' | 'excellent' | 'good' | 'fair';

export interface RvListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  rvClass: RvClass;
  condition: RvCondition;
  price: number;
  mileage?: number;
  lengthFt: number;
  sleeps: number;
  city: string;
  state: string;
  description: string;
  features: string[];
  image: string;
  sellerName: string;
  sellerUserId?: string;
  listedAt: string;
  /** Buyer rating for this listing (1–5) */
  rating: number;
  reviewCount: number;
  /** Seller trust score across marketplace (1–5) */
  sellerRating: number;
  sellerReviewCount: number;
  isDemo?: boolean;
}

export interface UsMarketState {
  code: string;
  name: string;
}

/** States commonly searched in the RV marketplace */
export const US_MARKET_STATES: UsMarketState[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'ID', name: 'Idaho' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MT', name: 'Montana' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'OR', name: 'Oregon' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'WA', name: 'Washington' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

export function getStateName(code: string): string {
  return US_MARKET_STATES.find((s) => s.code === code)?.name ?? code;
}

export function formatRating(value: number): string {
  return value.toFixed(1);
}

export const RV_CLASS_LABELS: Record<RvClass, string> = {
  'class-a': 'Class A',
  'class-b': 'Class B',
  'class-c': 'Class C',
  'travel-trailer': 'Travel Trailer',
  'fifth-wheel': 'Fifth Wheel',
  'truck-camper': 'Truck Camper',
  popup: 'Pop-up Camper',
};

export const RV_CONDITION_LABELS: Record<RvCondition, string> = {
  new: 'New',
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
};

export const RV_FEATURE_OPTIONS = [
  'Solar',
  'Generator',
  'Diesel',
  'Gas',
  'All-Electric',
  'Slide-outs',
  'Outdoor Kitchen',
  'Washer/Dryer',
  'King Bed',
  'Bunk Beds',
  'Pet Friendly',
  'Tow Package',
] as const;

export const SEED_RV_LISTINGS: RvListing[] = [
  {
    id: 'rv-seed-1',
    title: '2022 Winnebago View 24D — Mercedes Sprinter',
    make: 'Winnebago',
    model: 'View 24D',
    year: 2022,
    rvClass: 'class-c',
    condition: 'excellent',
    price: 118500,
    mileage: 28400,
    lengthFt: 25,
    sleeps: 4,
    city: 'Phoenix',
    state: 'AZ',
    description:
      'One-owner Class C on the Sprinter chassis. Diesel, 4x4 capable, solar + lithium. Perfect for national park loops and desert boondocking.',
    features: ['Solar', 'Diesel', 'Slide-outs', 'King Bed'],
    image: 'https://picsum.photos/id/111/800/500',
    sellerName: 'SouthwestRigs',
    listedAt: '2026-06-10T12:00:00.000Z',
    rating: 4.9,
    reviewCount: 18,
    sellerRating: 4.8,
    sellerReviewCount: 42,
    isDemo: true,
  },
  {
    id: 'rv-seed-2',
    title: '2019 Airstream Flying Cloud 27FB',
    make: 'Airstream',
    model: 'Flying Cloud 27FB',
    year: 2019,
    rvClass: 'travel-trailer',
    condition: 'excellent',
    price: 72900,
    lengthFt: 28,
    sleeps: 6,
    city: 'Austin',
    state: 'TX',
    description:
      'Iconic aluminum travel trailer with front bedroom layout. Stored indoors, never smoked in. Includes weight distribution hitch.',
    features: ['Solar', 'Outdoor Kitchen', 'King Bed', 'Pet Friendly'],
    image: 'https://picsum.photos/id/1048/800/500',
    sellerName: 'LoneStarAirstream',
    listedAt: '2026-06-08T09:00:00.000Z',
    rating: 4.7,
    reviewCount: 11,
    sellerRating: 4.9,
    sellerReviewCount: 27,
    isDemo: true,
  },
  {
    id: 'rv-seed-3',
    title: '2024 Grand Design Reflection 337RLS',
    make: 'Grand Design',
    model: 'Reflection 337RLS',
    year: 2024,
    rvClass: 'fifth-wheel',
    condition: 'new',
    price: 89995,
    lengthFt: 38,
    sleeps: 6,
    city: 'Boise',
    state: 'ID',
    description:
      'Brand-new fifth wheel with rear living, residential fridge, and auto-leveling. Dealer demo with full factory warranty remaining.',
    features: ['Generator', 'Slide-outs', 'Washer/Dryer', 'King Bed', 'Outdoor Kitchen'],
    image: 'https://picsum.photos/id/1041/800/500',
    sellerName: 'TreasureValleyRV',
    listedAt: '2026-06-12T16:00:00.000Z',
    rating: 5.0,
    reviewCount: 6,
    sellerRating: 4.7,
    sellerReviewCount: 19,
    isDemo: true,
  },
  {
    id: 'rv-seed-4',
    title: '2017 Thor Miramar 34.6 — Class A Gas',
    make: 'Thor',
    model: 'Miramar 34.6',
    year: 2017,
    rvClass: 'class-a',
    condition: 'good',
    price: 94500,
    mileage: 41200,
    lengthFt: 36,
    sleeps: 8,
    city: 'Orlando',
    state: 'FL',
    description:
      'Spacious Class A with bunk-over-cab and residential feel. Recent tires, roof reseal, and full-service records. Ready for snowbird season.',
    features: ['Gas', 'Generator', 'Slide-outs', 'Bunk Beds', 'Tow Package'],
    image: 'https://picsum.photos/id/1043/800/500',
    sellerName: 'FloridaFullTimer',
    listedAt: '2026-06-05T11:00:00.000Z',
    rating: 4.5,
    reviewCount: 23,
    sellerRating: 4.6,
    sellerReviewCount: 58,
    isDemo: true,
  },
  {
    id: 'rv-seed-5',
    title: '2021 Pleasure-Way Ontour 2.2 — Class B Van',
    make: 'Pleasure-Way',
    model: 'Ontour 2.2',
    year: 2021,
    rvClass: 'class-b',
    condition: 'excellent',
    price: 132000,
    mileage: 19800,
    lengthFt: 22,
    sleeps: 2,
    city: 'Denver',
    state: 'CO',
    description:
      'Compact Class B on RAM ProMaster. Wet bath, induction cooktop, Truma heat. Easy to park in town and stealth camp between trailheads.',
    features: ['Solar', 'Diesel', 'All-Electric', 'Pet Friendly'],
    image: 'https://picsum.photos/id/1044/800/500',
    sellerName: 'MountainVanLife',
    listedAt: '2026-06-14T08:00:00.000Z',
    rating: 4.8,
    reviewCount: 14,
    sellerRating: 4.9,
    sellerReviewCount: 31,
    isDemo: true,
  },
  {
    id: 'rv-seed-6',
    title: '2015 Jayco Jay Flight 26BH — Family Bunk',
    make: 'Jayco',
    model: 'Jay Flight 26BH',
    year: 2015,
    rvClass: 'travel-trailer',
    condition: 'good',
    price: 18900,
    lengthFt: 29,
    sleeps: 8,
    city: 'Nashville',
    state: 'TN',
    description:
      'Affordable family starter trailer with double bunks and outdoor kitchen. Clean title, new brakes, and fresh bearings. Towable with half-ton.',
    features: ['Outdoor Kitchen', 'Bunk Beds', 'Tow Package'],
    image: 'https://picsum.photos/id/1047/800/500',
    sellerName: 'MusicCityCampers',
    listedAt: '2026-06-11T14:00:00.000Z',
    rating: 4.4,
    reviewCount: 9,
    sellerRating: 4.5,
    sellerReviewCount: 15,
    isDemo: true,
  },
  {
    id: 'rv-seed-7',
    title: '2020 Lance 855S Truck Camper',
    make: 'Lance',
    model: '855S',
    year: 2020,
    rvClass: 'truck-camper',
    condition: 'excellent',
    price: 42500,
    lengthFt: 17,
    sleeps: 3,
    city: 'Bend',
    state: 'OR',
    description:
      'Lightweight truck camper for full-size short-bed trucks. Side entry, wet bath, and fantastic insulation for shoulder-season camping.',
    features: ['Solar', 'Diesel', 'King Bed'],
    image: 'https://picsum.photos/id/1050/800/500',
    sellerName: 'PNWOverlander',
    listedAt: '2026-06-09T10:00:00.000Z',
    rating: 4.6,
    reviewCount: 12,
    sellerRating: 4.7,
    sellerReviewCount: 22,
    isDemo: true,
  },
  {
    id: 'rv-seed-8',
    title: '2023 Forest River Rockwood Mini Lite 2506S',
    make: 'Forest River',
    model: 'Rockwood Mini Lite 2506S',
    year: 2023,
    rvClass: 'popup',
    condition: 'excellent',
    price: 24900,
    lengthFt: 21,
    sleeps: 6,
    city: 'Traverse City',
    state: 'MI',
    description:
      'Hybrid pop-up with hard sides and expandable canvas bunks. Lightweight and easy to store. Great first rig for lake weekends.',
    features: ['Bunk Beds', 'Tow Package', 'Pet Friendly'],
    image: 'https://picsum.photos/id/1051/800/500',
    sellerName: 'GreatLakesWeekender',
    listedAt: '2026-06-13T17:00:00.000Z',
    rating: 4.3,
    reviewCount: 7,
    sellerRating: 4.4,
    sellerReviewCount: 12,
    isDemo: true,
  },
  {
    id: 'rv-seed-9',
    title: '2023 Thor Chateau 31W — Family Class C',
    make: 'Thor',
    model: 'Chateau 31W',
    year: 2023,
    rvClass: 'class-c',
    condition: 'excellent',
    price: 104900,
    mileage: 15600,
    lengthFt: 32,
    sleeps: 7,
    city: 'Sacramento',
    state: 'CA',
    description:
      'Family-friendly Class C with walk-through to cab, outdoor TV prep, and huge wardrobe. One owner, garage-kept, smoke-free.',
    features: ['Gas', 'Generator', 'Slide-outs', 'Bunk Beds', 'Outdoor Kitchen'],
    image: 'https://picsum.photos/id/1052/800/500',
    sellerName: 'GoldenStateRVs',
    listedAt: '2026-06-15T10:00:00.000Z',
    rating: 4.8,
    reviewCount: 16,
    sellerRating: 4.8,
    sellerReviewCount: 36,
    isDemo: true,
  },
  {
    id: 'rv-seed-10',
    title: '2018 Keystone Montana 3160RL — Luxury Fifth Wheel',
    make: 'Keystone',
    model: 'Montana 3160RL',
    year: 2018,
    rvClass: 'fifth-wheel',
    condition: 'good',
    price: 54900,
    lengthFt: 35,
    sleeps: 4,
    city: 'Asheville',
    state: 'NC',
    description:
      'Mountain-ready fifth wheel with rear living, fireplace, and central vacuum. Well maintained with new tires and bearings.',
    features: ['Generator', 'Slide-outs', 'Washer/Dryer', 'King Bed'],
    image: 'https://picsum.photos/id/1053/800/500',
    sellerName: 'BlueRidgeRigs',
    listedAt: '2026-06-07T13:00:00.000Z',
    rating: 4.6,
    reviewCount: 20,
    sellerRating: 4.7,
    sellerReviewCount: 44,
    isDemo: true,
  },
  {
    id: 'rv-seed-11',
    title: '2022 Storyteller Overland MODE LT — 4x4 Adventure Van',
    make: 'Storyteller',
    model: 'MODE LT',
    year: 2022,
    rvClass: 'class-b',
    condition: 'excellent',
    price: 189000,
    mileage: 22100,
    lengthFt: 20,
    sleeps: 2,
    city: 'Seattle',
    state: 'WA',
    description:
      'Go-anywhere 4x4 adventure van with lithium, air conditioning, and modular garage. Built for off-grid national forest camping.',
    features: ['Solar', 'Diesel', 'All-Electric', 'Pet Friendly'],
    image: 'https://picsum.photos/id/1054/800/500',
    sellerName: 'CascadeVanCo',
    listedAt: '2026-06-16T09:00:00.000Z',
    rating: 4.9,
    reviewCount: 10,
    sellerRating: 5.0,
    sellerReviewCount: 18,
    isDemo: true,
  },
];

export function formatRvPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatListedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}