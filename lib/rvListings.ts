import { marketplaceRvImageForClass } from './marketplaceImages';

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
  /** Official RVCHAIN certification (subscribed sellers, moderator-reviewed) */
  rvchainCertified?: boolean;
  certifiedAt?: string;
  certifiedBy?: string;
  isDemo?: boolean;
  /** How the listing was paid for */
  listingAccess?: 'single' | 'seller-pro';
  expiresAt?: string | null;
  status?: 'active' | 'sold' | 'expired' | 'draft';
  soldAt?: string;
  saleId?: string;
}

export interface UsMarketState {
  code: string;
  name: string;
}

/** All 50 US states — RV marketplace search & listing */
export const US_MARKET_STATES: UsMarketState[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

export const US_STATE_COUNT = 50;

export function getStateName(code: string): string {
  return US_MARKET_STATES.find((s) => s.code === code)?.name ?? code;
}

/** True when every US state code appears in the listing set */
export function hasFiftyStateListingCoverage(listings: RvListing[]): boolean {
  const present = new Set(listings.map((l) => l.state));
  return US_MARKET_STATES.length === US_STATE_COUNT && US_MARKET_STATES.every((s) => present.has(s.code));
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

/**
 * Fictional demo-only make/model names. Not real manufacturers, product lines,
 * or trademarks — sample data for the marketplace UI.
 */
export const DEMO_RV_MAKES = [
  'Trailforge',
  'OpenRoost',
  'HorizonNest',
  'Ridgeway Coach',
  'Campora',
  'Northloop',
  'Mesaform',
  'Wanderkiln',
  'Pinespan',
  'Riverbond',
  'Skyhaul',
  'Valevan',
] as const;

const DEMO_RV_MODELS = [
  'Nestline 28',
  'Drift 240',
  'Ridgeline XL',
  'Campora Path 22',
  'Northloop Ember',
  'Mesaform Loop 35',
  'Wanderkiln Roam',
  'Pinespan Bunk 26',
  'Riverbond Haul 17',
  'Skyhaul Vista 31',
  'Valevan Mode 20',
  'OpenRoost Cabin 24',
] as const;

const FEATURED_RV_LISTINGS: RvListing[] = [
  {
    id: 'rv-seed-1',
    title: '2022 HorizonNest Drift 240 — Class C',
    make: 'HorizonNest',
    model: 'Drift 240',
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
      'Demo sample: one-owner Class C. Diesel, solar + lithium. Fictional listing for UI preview only — not a real unit for sale.',
    features: ['Solar', 'Diesel', 'Slide-outs', 'King Bed'],
    image: marketplaceRvImageForClass('class-c'),
    sellerName: 'DemoSeller_SW',
    listedAt: '2026-06-10T12:00:00.000Z',
    rating: 4.9,
    reviewCount: 18,
    sellerRating: 4.8,
    sellerReviewCount: 42,
    isDemo: true,
  },
  {
    id: 'rv-seed-2',
    title: '2019 OpenRoost Nestline 28',
    make: 'OpenRoost',
    model: 'Nestline 28',
    year: 2019,
    rvClass: 'travel-trailer',
    condition: 'excellent',
    price: 72900,
    lengthFt: 28,
    sleeps: 6,
    city: 'Austin',
    state: 'TX',
    description:
      'Demo sample travel trailer with front bedroom layout. Stored indoors. Fictional listing — not a real sale.',
    features: ['Solar', 'Outdoor Kitchen', 'King Bed', 'Pet Friendly'],
    image: marketplaceRvImageForClass('travel-trailer'),
    sellerName: 'DemoSeller_TX',
    listedAt: '2026-06-08T09:00:00.000Z',
    rating: 4.7,
    reviewCount: 11,
    sellerRating: 4.9,
    sellerReviewCount: 27,
    isDemo: true,
  },
  {
    id: 'rv-seed-3',
    title: '2024 Mesaform Loop 35',
    make: 'Mesaform',
    model: 'Loop 35',
    year: 2024,
    rvClass: 'fifth-wheel',
    condition: 'new',
    price: 89995,
    lengthFt: 38,
    sleeps: 6,
    city: 'Boise',
    state: 'ID',
    description:
      'Demo sample fifth wheel with rear living and auto-leveling. Fictional listing for marketplace preview only.',
    features: ['Generator', 'Slide-outs', 'Washer/Dryer', 'King Bed', 'Outdoor Kitchen'],
    image: marketplaceRvImageForClass('fifth-wheel'),
    sellerName: 'DemoSeller_ID',
    listedAt: '2026-06-12T16:00:00.000Z',
    rating: 5.0,
    reviewCount: 6,
    sellerRating: 4.7,
    sellerReviewCount: 19,
    isDemo: true,
  },
  {
    id: 'rv-seed-4',
    title: '2017 Skyhaul Vista 31 — Class A',
    make: 'Skyhaul',
    model: 'Vista 31',
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
      'Demo sample Class A with bunk-over-cab layout. Fictional listing — not a real motorhome for sale.',
    features: ['Gas', 'Generator', 'Slide-outs', 'Bunk Beds', 'Tow Package'],
    image: marketplaceRvImageForClass('class-a'),
    sellerName: 'DemoSeller_FL',
    listedAt: '2026-06-05T11:00:00.000Z',
    rating: 4.5,
    reviewCount: 23,
    sellerRating: 4.6,
    sellerReviewCount: 58,
    isDemo: true,
  },
  {
    id: 'rv-seed-5',
    title: '2021 Valevan Mode 20 — Class B',
    make: 'Valevan',
    model: 'Mode 20',
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
      'Demo sample compact Class B van. Wet bath and induction cooktop. Fictional listing for UI only.',
    features: ['Solar', 'Diesel', 'All-Electric', 'Pet Friendly'],
    image: marketplaceRvImageForClass('class-b'),
    sellerName: 'DemoSeller_CO',
    listedAt: '2026-06-14T08:00:00.000Z',
    rating: 4.8,
    reviewCount: 14,
    sellerRating: 4.9,
    sellerReviewCount: 31,
    isDemo: true,
  },
  {
    id: 'rv-seed-6',
    title: '2015 Pinespan Bunk 26 — Family',
    make: 'Pinespan',
    model: 'Bunk 26',
    year: 2015,
    rvClass: 'travel-trailer',
    condition: 'good',
    price: 18900,
    lengthFt: 29,
    sleeps: 8,
    city: 'Nashville',
    state: 'TN',
    description:
      'Demo sample family bunk trailer. Fictional listing — not a real sale.',
    features: ['Outdoor Kitchen', 'Bunk Beds', 'Tow Package'],
    image: marketplaceRvImageForClass('travel-trailer'),
    sellerName: 'DemoSeller_TN',
    listedAt: '2026-06-11T14:00:00.000Z',
    rating: 4.4,
    reviewCount: 9,
    sellerRating: 4.5,
    sellerReviewCount: 15,
    isDemo: true,
  },
  {
    id: 'rv-seed-7',
    title: '2020 Riverbond Haul 17',
    make: 'Riverbond',
    model: 'Haul 17',
    year: 2020,
    rvClass: 'truck-camper',
    condition: 'excellent',
    price: 42500,
    lengthFt: 17,
    sleeps: 3,
    city: 'Bend',
    state: 'OR',
    description:
      'Demo sample lightweight truck camper. Fictional listing for marketplace preview only.',
    features: ['Solar', 'Diesel', 'King Bed'],
    image: marketplaceRvImageForClass('truck-camper'),
    sellerName: 'DemoSeller_OR',
    listedAt: '2026-06-09T10:00:00.000Z',
    rating: 4.6,
    reviewCount: 12,
    sellerRating: 4.7,
    sellerReviewCount: 22,
    isDemo: true,
  },
  {
    id: 'rv-seed-8',
    title: '2023 Campora Path 22',
    make: 'Campora',
    model: 'Path 22',
    year: 2023,
    rvClass: 'popup',
    condition: 'excellent',
    price: 24900,
    lengthFt: 21,
    sleeps: 6,
    city: 'Traverse City',
    state: 'MI',
    description:
      'Demo sample hybrid pop-up. Fictional listing — not a real product for sale.',
    features: ['Bunk Beds', 'Tow Package', 'Pet Friendly'],
    image: marketplaceRvImageForClass('popup'),
    sellerName: 'DemoSeller_MI',
    listedAt: '2026-06-13T17:00:00.000Z',
    rating: 4.3,
    reviewCount: 7,
    sellerRating: 4.4,
    sellerReviewCount: 12,
    isDemo: true,
  },
  {
    id: 'rv-seed-9',
    title: '2023 OpenRoost Cabin 24 — Class C',
    make: 'OpenRoost',
    model: 'Cabin 24',
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
      'Demo sample family Class C. Fictional listing for UI preview only.',
    features: ['Gas', 'Generator', 'Slide-outs', 'Bunk Beds', 'Outdoor Kitchen'],
    image: marketplaceRvImageForClass('class-c'),
    sellerName: 'DemoSeller_CA',
    listedAt: '2026-06-15T10:00:00.000Z',
    rating: 4.8,
    reviewCount: 16,
    sellerRating: 4.8,
    sellerReviewCount: 36,
    isDemo: true,
  },
  {
    id: 'rv-seed-10',
    title: '2018 Ridgeway Coach Ridgeline XL',
    make: 'Ridgeway Coach',
    model: 'Ridgeline XL',
    year: 2018,
    rvClass: 'fifth-wheel',
    condition: 'good',
    price: 54900,
    lengthFt: 35,
    sleeps: 4,
    city: 'Asheville',
    state: 'NC',
    description:
      'Demo sample fifth wheel with rear living. Fictional listing — not a real sale.',
    features: ['Generator', 'Slide-outs', 'Washer/Dryer', 'King Bed'],
    image: marketplaceRvImageForClass('fifth-wheel'),
    sellerName: 'DemoSeller_NC',
    listedAt: '2026-06-07T13:00:00.000Z',
    rating: 4.6,
    reviewCount: 20,
    sellerRating: 4.7,
    sellerReviewCount: 44,
    isDemo: true,
  },
  {
    id: 'rv-seed-11',
    title: '2022 Northloop Ember — Adventure Van',
    make: 'Northloop',
    model: 'Ember',
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
      'Demo sample adventure van with lithium power. Fictional listing for marketplace preview only.',
    features: ['Solar', 'Diesel', 'All-Electric', 'Pet Friendly'],
    image: marketplaceRvImageForClass('class-b'),
    sellerName: 'DemoSeller_WA',
    listedAt: '2026-06-16T09:00:00.000Z',
    rating: 4.9,
    reviewCount: 10,
    sellerRating: 5.0,
    sellerReviewCount: 18,
    isDemo: true,
  },
];

const STATE_COVERAGE_CLASSES: RvClass[] = [
  'travel-trailer',
  'class-c',
  'fifth-wheel',
  'class-a',
  'class-b',
  'truck-camper',
  'popup',
];

/** One fictional demo listing per remaining state — all names invented for UI coverage */
function buildStateCoverageListings(featured: RvListing[]): RvListing[] {
  const covered = new Set(featured.map((l) => l.state));
  return US_MARKET_STATES.filter((s) => !covered.has(s.code)).map((s, i) => {
    const make = DEMO_RV_MAKES[i % DEMO_RV_MAKES.length];
    const model = DEMO_RV_MODELS[i % DEMO_RV_MODELS.length];
    const year = 2016 + (i % 9);
    return {
      id: `rv-seed-state-${s.code}`,
      title: `${year} ${make} ${model} — ${s.name} (demo)`,
      make,
      model,
      year,
      rvClass: STATE_COVERAGE_CLASSES[i % STATE_COVERAGE_CLASSES.length],
      condition: 'good' as RvCondition,
      price: 22000 + ((i * 1373) % 75000),
      lengthFt: 24 + (i % 12),
      sleeps: 4 + (i % 4),
      city: `Demo City ${s.code}`,
      state: s.code,
      description: `Fictional demo RV listing in ${s.name}. Sample data only — not a real vehicle, dealer, or brand. No sale will occur.`,
      features: ['Tow Package', 'Pet Friendly'],
      image: marketplaceRvImageForClass(STATE_COVERAGE_CLASSES[i % STATE_COVERAGE_CLASSES.length], i),
      sellerName: `DemoSeller_${s.code}`,
      listedAt: `2026-05-${String(1 + (i % 28)).padStart(2, '0')}T12:00:00.000Z`,
      rating: Math.round((4.1 + (i % 9) * 0.1) * 10) / 10,
      reviewCount: 2 + (i % 12),
      sellerRating: 4.4 + (i % 6) * 0.1,
      sellerReviewCount: 5 + (i % 18),
      isDemo: true,
    };
  });
}

export const SEED_RV_LISTINGS: RvListing[] = [
  ...FEATURED_RV_LISTINGS,
  ...buildStateCoverageListings(FEATURED_RV_LISTINGS),
];

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  if (!hasFiftyStateListingCoverage(SEED_RV_LISTINGS)) {
    console.warn('[rvchain] SEED_RV_LISTINGS does not cover all 50 US states');
  }
  if (US_MARKET_STATES.length !== US_STATE_COUNT) {
    console.warn(`[rvchain] US_MARKET_STATES expected ${US_STATE_COUNT}, got ${US_MARKET_STATES.length}`);
  }
}

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