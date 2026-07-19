/** Local Grok Imagine campground scenes in /public/spots — app-owned art only (no stock hosts). */

export const SPOT_IMAGES = [
  '/spots/spot-red-rock.jpg',
  '/spots/spot-coast.jpg',
  '/spots/spot-alpine-lake.jpg',
  '/spots/spot-redwoods.jpg',
  '/spots/spot-river.jpg',
  '/spots/spot-beach.jpg',
  '/spots/spot-starry.jpg',
] as const;

export const DEFAULT_SPOT_IMAGE = SPOT_IMAGES[0];

export function spotImageByIndex(index: number): string {
  return SPOT_IMAGES[((index % SPOT_IMAGES.length) + SPOT_IMAGES.length) % SPOT_IMAGES.length];
}

/** Only allow same-origin Grok assets under /spots or /marketplace; never remote stock URLs. */
export function resolveParkImage(image: string | null | undefined, index = 0): string {
  if (image && isLocalGrokAsset(image)) return image;
  return spotImageByIndex(index);
}

export function isLocalGrokAsset(url: string): boolean {
  if (!url.startsWith('/')) return false;
  return (
    url.startsWith('/spots/') ||
    url.startsWith('/marketplace/') ||
    url.startsWith('/kids/') ||
    url === '/rvchain-logo.jpg' ||
    url === '/rvchain-scene-bg.jpg'
  );
}
