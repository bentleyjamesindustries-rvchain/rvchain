import { parks as demoParks, type Park } from './parks';
import { publicCampgrounds } from './publicCampgrounds';

function dedupeKey(park: Park): string {
  return `${park.name.toLowerCase().trim()}|${(park.state ?? '').toUpperCase()}|${(park.city ?? '').toLowerCase().trim()}`;
}

/** Demo seed parks plus extra fictional sample campgrounds (not real places). */
export function getLocalParkCatalog(): Park[] {
  const seen = new Set<string>();
  const merged: Park[] = [];

  for (const park of [...demoParks, ...publicCampgrounds]) {
    const key = dedupeKey(park);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(park);
  }

  return merged;
}

export function getCatalogStates(parks: Park[]): string[] {
  return [...new Set(parks.map((p) => p.state).filter((s): s is string => Boolean(s)))].sort();
}

export const LOCAL_PARK_CATALOG = getLocalParkCatalog();
export const CATALOG_STATES = getCatalogStates(LOCAL_PARK_CATALOG);