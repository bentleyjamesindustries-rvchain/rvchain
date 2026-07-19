import type { Park } from './parks';
import { resolveParkImage } from './spotImages';

export function mergeParkVerification(park: Park): Park {
  return park;
}

/** Ensure park images are always local Grok Imagine assets (never remote stock). */
export function enrichParks(parks: Park[]): Park[] {
  return parks.map((park, index) => ({
    ...park,
    image: resolveParkImage(park.image, index),
  }));
}
