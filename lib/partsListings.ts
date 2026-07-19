export type PartsCategoryId =
  | 'tires-wheels'
  | 'towing-hitch'
  | 'plumbing'
  | 'electrical'
  | 'covers-protection'
  | 'leveling-jacks'
  | 'other';

export type PartsCondition = 'new' | 'like-new' | 'good' | 'fair' | 'for-parts';

export interface PartsListing {
  id: string;
  title: string;
  partsCategory: PartsCategoryId;
  brand?: string;
  condition: PartsCondition;
  price: number;
  quantity: number;
  city: string;
  state: string;
  description: string;
  image: string;
  sellerName: string;
  sellerUserId?: string;
  listedAt: string;
  isDemo?: boolean;
  listingAccess?: 'single' | 'seller-pro';
  expiresAt?: string | null;
  status?: 'active' | 'sold' | 'expired' | 'draft';
  soldAt?: string;
  saleId?: string;
}

export const PARTS_CATEGORY_LABELS: Record<PartsCategoryId, string> = {
  'tires-wheels': 'Tires & wheels',
  'towing-hitch': 'Towing & hitch',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  'covers-protection': 'Covers & protection',
  'leveling-jacks': 'Leveling & jacks',
  other: 'Other parts',
};

export const PARTS_CONDITION_LABELS: Record<PartsCondition, string> = {
  new: 'New',
  'like-new': 'Like new',
  good: 'Good',
  fair: 'Fair',
  'for-parts': 'For parts',
};

export function formatPartsPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
}

export const SEED_PARTS_LISTINGS: PartsListing[] = [
  {
    id: 'parts-demo-1',
    title: 'Weight distribution hitch (used)',
    partsCategory: 'towing-hitch',
    brand: 'Generic',
    condition: 'good',
    price: 185,
    quantity: 1,
    city: 'Dallas',
    state: 'TX',
    description: 'Complete set with bars. Fitment is buyer responsibility.',
    image: 'https://picsum.photos/id/133/800/500',
    sellerName: 'TowPro',
    sellerUserId: 'demo-seller-parts-1',
    listedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    isDemo: true,
    status: 'active',
  },
  {
    id: 'parts-demo-2',
    title: 'Pair of ST225/75R15 trailer tires (50%)',
    partsCategory: 'tires-wheels',
    condition: 'fair',
    price: 90,
    quantity: 2,
    city: 'Salt Lake City',
    state: 'UT',
    description: 'About half tread. Good spares or short season use.',
    image: 'https://picsum.photos/id/1071/800/500',
    sellerName: 'RubberRoad',
    sellerUserId: 'demo-seller-parts-2',
    listedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    isDemo: true,
    status: 'active',
  },
  {
    id: 'parts-demo-3',
    title: 'RV battery 12V deep cycle',
    partsCategory: 'electrical',
    condition: 'good',
    price: 110,
    quantity: 1,
    city: 'Reno',
    state: 'NV',
    description: 'Load tested. Local pickup — heavy.',
    image: 'https://picsum.photos/id/250/800/500',
    sellerName: 'VoltCamp',
    sellerUserId: 'demo-seller-parts-3',
    listedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isDemo: true,
    status: 'active',
  },
  {
    id: 'parts-demo-4',
    title: 'Travel trailer cover (mid-size)',
    partsCategory: 'covers-protection',
    condition: 'like-new',
    price: 75,
    quantity: 1,
    city: 'Charlotte',
    state: 'NC',
    description: 'Used one winter. Straps included. Confirm your length.',
    image: 'https://picsum.photos/id/122/800/500',
    sellerName: 'CoverUp',
    sellerUserId: 'demo-seller-parts-4',
    listedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    isDemo: true,
    status: 'active',
  },
];
