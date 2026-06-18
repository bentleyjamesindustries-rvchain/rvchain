import type { LucideIcon } from 'lucide-react';
import { Truck, Tent, Users, MapPin, AlertTriangle, Wrench } from 'lucide-react';

export type ForumCategoryId = 'rv' | 'tent' | 'all';
export type ForumSubcategoryId = 'destinations' | 'construction' | 'maintenance';

export interface ForumCategory {
  id: ForumCategoryId;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  borderAccent: string;
}

export interface ForumSubcategory {
  id: ForumSubcategoryId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const FORUM_CATEGORIES: ForumCategory[] = [
  {
    id: 'rv',
    label: 'RV Campers',
    description: 'Class A/B/C, fifth wheels, travel trailers, and full-timers.',
    icon: Truck,
    accent: 'text-emerald-400',
    borderAccent: 'border-emerald-700/60',
  },
  {
    id: 'tent',
    label: 'Tent Campers',
    description: 'Tent sites, car camping, backpacking, and pop-up campers.',
    icon: Tent,
    accent: 'text-sky-400',
    borderAccent: 'border-sky-700/60',
  },
  {
    id: 'all',
    label: 'All Campers',
    description: 'Tips and talk for every kind of outdoor traveler.',
    icon: Users,
    accent: 'text-amber-400',
    borderAccent: 'border-amber-700/60',
  },
];

export const FORUM_SUBCATEGORIES: ForumSubcategory[] = [
  {
    id: 'destinations',
    label: 'Destination Favorites',
    description: 'Parks, routes, hidden gems, and must-see spots.',
    icon: MapPin,
  },
  {
    id: 'construction',
    label: 'Construction Warnings',
    description: 'Road work, bridge closures, detours, and access alerts.',
    icon: AlertTriangle,
  },
  {
    id: 'maintenance',
    label: 'Repairs / Maintenance Tips',
    description: 'Fixes, upgrades, gear advice, and roadside know-how.',
    icon: Wrench,
  },
];

export function getForumCategory(id: ForumCategoryId): ForumCategory {
  return FORUM_CATEGORIES.find((c) => c.id === id) ?? FORUM_CATEGORIES[0];
}

export function getForumSubcategory(id: ForumSubcategoryId): ForumSubcategory {
  return FORUM_SUBCATEGORIES.find((s) => s.id === id) ?? FORUM_SUBCATEGORIES[0];
}