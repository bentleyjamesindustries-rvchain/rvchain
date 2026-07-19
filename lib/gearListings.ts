import { marketplaceGearImage } from './marketplaceImages';

export type GearCategoryId =
  | 'shelter'
  | 'comfort'
  | 'kitchen'
  | 'power'
  | 'water'
  | 'outdoor'
  | 'other';

export type GearCondition = 'new' | 'like-new' | 'good' | 'fair';

export interface GearListing {
  id: string;
  title: string;
  gearCategory: GearCategoryId;
  brand?: string;
  condition: GearCondition;
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

export const GEAR_CATEGORY_LABELS: Record<GearCategoryId, string> = {
  shelter: 'Shelter & tents',
  comfort: 'Comfort & seating',
  kitchen: 'Kitchen & coolers',
  power: 'Power & solar',
  water: 'Water & hydration',
  outdoor: 'Outdoor & recreation',
  other: 'Other gear',
};

export const GEAR_CONDITION_LABELS: Record<GearCondition, string> = {
  new: 'New',
  'like-new': 'Like new',
  good: 'Good',
  fair: 'Fair',
};

export function formatGearPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
}

/** Demo seed gear */
export const SEED_GEAR_LISTINGS: GearListing[] = [
  {
    id: 'gear-demo-1',
    title: '45qt camp cooler (demo sample)',
    gearCategory: 'kitchen',
    brand: 'Campora Cool',
    condition: 'good',
    price: 120,
    quantity: 1,
    city: 'Denver',
    state: 'CO',
    description: 'Holds ice 2–3 days. Minor scuffs. Local pickup preferred.',
    image: marketplaceGearImage(0),
    sellerName: 'DemoGear_1',
    sellerUserId: 'demo-seller-gear-1',
    listedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isDemo: true,
    status: 'active',
  },
  {
    id: 'gear-demo-2',
    title: 'Pair of camp chairs with cup holders',
    gearCategory: 'comfort',
    condition: 'like-new',
    price: 45,
    quantity: 2,
    city: 'Austin',
    state: 'TX',
    description: 'Used one season. Fold flat for storage.',
    image: marketplaceGearImage(1),
    sellerName: 'DemoGear_2',
    sellerUserId: 'demo-seller-gear-2',
    listedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isDemo: true,
    status: 'active',
  },
  {
    id: 'gear-demo-3',
    title: '100W foldable solar blanket',
    gearCategory: 'power',
    brand: 'Sunloop Demo',
    condition: 'good',
    price: 160,
    quantity: 1,
    city: 'Phoenix',
    state: 'AZ',
    description: 'MC4 connectors. Good for topping house batteries on sunny days.',
    image: marketplaceGearImage(2),
    sellerName: 'DemoGear_3',
    sellerUserId: 'demo-seller-gear-3',
    listedAt: new Date(Date.now() - 86400000).toISOString(),
    isDemo: true,
    status: 'active',
  },
  {
    id: 'gear-demo-4',
    title: '4-person dome tent',
    gearCategory: 'shelter',
    condition: 'good',
    price: 85,
    quantity: 1,
    city: 'Portland',
    state: 'OR',
    description: 'Rainfly included. One pole slightly bent but pitches fine.',
    image: marketplaceGearImage(3),
    sellerName: 'DemoGear_4',
    sellerUserId: 'demo-seller-gear-4',
    listedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    isDemo: true,
    status: 'active',
  },
  {
    id: 'gear-demo-5',
    title: 'Portable propane fire bowl',
    gearCategory: 'outdoor',
    condition: 'like-new',
    price: 95,
    quantity: 1,
    city: 'Boise',
    state: 'ID',
    description: 'Tabletop size. Great for no-burn-ban evenings.',
    image: marketplaceGearImage(4),
    sellerName: 'DemoGear_5',
    sellerUserId: 'demo-seller-gear-5',
    listedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    isDemo: true,
    status: 'active',
  },
  {
    id: 'gear-demo-6',
    title: 'Fresh water hose 25ft + filter',
    gearCategory: 'water',
    condition: 'new',
    price: 28,
    quantity: 1,
    city: 'Tampa',
    state: 'FL',
    description: 'Drinking-water rated. Still in packaging.',
    image: marketplaceGearImage(5),
    sellerName: 'DemoGear_6',
    sellerUserId: 'demo-seller-gear-6',
    listedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    isDemo: true,
    status: 'active',
  },
];
