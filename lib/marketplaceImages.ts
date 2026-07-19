/** Local Grok Imagine marketplace assets in /public/marketplace — app-owned art only. */

import { isLocalGrokAsset } from './spotImages';

export const MARKETPLACE_RV_IMAGES = [
  '/marketplace/rv-class-a.jpg',
  '/marketplace/rv-class-b.jpg',
  '/marketplace/rv-class-c.jpg',
  '/marketplace/rv-travel-trailer.jpg',
  '/marketplace/rv-fifth-wheel.jpg',
  '/marketplace/rv-truck-camper.jpg',
] as const;

export const MARKETPLACE_GEAR_IMAGES = [
  '/marketplace/gear-cooler.jpg',
  '/marketplace/gear-chairs.jpg',
  '/marketplace/gear-solar.jpg',
  '/marketplace/gear-tent.jpg',
  '/marketplace/gear-firepit.jpg',
  '/marketplace/gear-hose.jpg',
] as const;

export const MARKETPLACE_PARTS_IMAGES = [
  '/marketplace/parts-hitch.jpg',
  '/marketplace/parts-tires.jpg',
  '/marketplace/parts-battery.jpg',
  '/marketplace/parts-cover.jpg',
] as const;

export const DEFAULT_RV_IMAGE = MARKETPLACE_RV_IMAGES[0];
export const DEFAULT_GEAR_IMAGE = MARKETPLACE_GEAR_IMAGES[0];
export const DEFAULT_PARTS_IMAGE = MARKETPLACE_PARTS_IMAGES[0];

export function marketplaceRvImageForClass(rvClass: string, index = 0): string {
  const byClass: Record<string, string> = {
    'class-a': '/marketplace/rv-class-a.jpg',
    'class-b': '/marketplace/rv-class-b.jpg',
    'class-c': '/marketplace/rv-class-c.jpg',
    'travel-trailer': '/marketplace/rv-travel-trailer.jpg',
    'fifth-wheel': '/marketplace/rv-fifth-wheel.jpg',
    'truck-camper': '/marketplace/rv-truck-camper.jpg',
    popup: '/marketplace/rv-travel-trailer.jpg',
  };
  return byClass[rvClass] ?? MARKETPLACE_RV_IMAGES[index % MARKETPLACE_RV_IMAGES.length];
}

export function marketplaceGearImage(index: number): string {
  return MARKETPLACE_GEAR_IMAGES[index % MARKETPLACE_GEAR_IMAGES.length];
}

export function marketplacePartsImage(index: number): string {
  return MARKETPLACE_PARTS_IMAGES[index % MARKETPLACE_PARTS_IMAGES.length];
}

export function marketplaceRvImageByIndex(index: number): string {
  return MARKETPLACE_RV_IMAGES[index % MARKETPLACE_RV_IMAGES.length];
}

/** Reject remote stock URLs; keep local Grok paths or data: uploads. */
export function resolveMarketplaceImage(
  image: string | null | undefined,
  fallback: string
): string {
  if (!image) return fallback;
  if (image.startsWith('data:image/')) return image;
  if (isLocalGrokAsset(image)) return image;
  return fallback;
}
