import { Park } from './parks';
import type { ChecklistPackId } from './tripChecklists';

export interface StoredTrip {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
  camper_packs?: ChecklistPackId[];
}

export interface StoredTripPark {
  trip_id: string;
  park_id: string;
  visit_order: number;
  parks?: Park;
}

export interface TripChecklistProgress {
  tripId: string;
  packId: ChecklistPackId;
  checkedIds: string[];
}

const tripsKey = (userId: string) => `rvchain_trips_${userId}`;
const parksKey = (userId: string) => `rvchain_trip_parks_${userId}`;
const progressKey = (userId: string) => `rvchain_trip_checklist_progress_${userId}`;

function readTrips(userId: string): StoredTrip[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(tripsKey(userId)) || '[]');
  } catch {
    return [];
  }
}

function writeTrips(userId: string, trips: StoredTrip[]) {
  localStorage.setItem(tripsKey(userId), JSON.stringify(trips));
}

function readTripParks(userId: string): StoredTripPark[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(parksKey(userId)) || '[]');
  } catch {
    return [];
  }
}

function writeTripParks(userId: string, entries: StoredTripPark[]) {
  localStorage.setItem(parksKey(userId), JSON.stringify(entries));
}

function readProgress(userId: string): TripChecklistProgress[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(progressKey(userId)) || '[]');
  } catch {
    return [];
  }
}

function writeProgress(userId: string, entries: TripChecklistProgress[]) {
  localStorage.setItem(progressKey(userId), JSON.stringify(entries));
}

export function listLocalTrips(userId: string): StoredTrip[] {
  return readTrips(userId).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function createLocalTrip(userId: string, title: string): StoredTrip {
  const trip: StoredTrip = {
    id: `local-trip-${Date.now()}`,
    user_id: userId,
    title,
    created_at: new Date().toISOString(),
    camper_packs: [],
  };
  const trips = readTrips(userId);
  writeTrips(userId, [trip, ...trips]);
  return trip;
}

export function updateLocalTrip(
  userId: string,
  tripId: string,
  patch: Partial<Pick<StoredTrip, 'title' | 'start_date' | 'end_date' | 'notes' | 'camper_packs'>>
): StoredTrip | null {
  const trips = readTrips(userId);
  const idx = trips.findIndex((t) => t.id === tripId);
  if (idx < 0) return null;
  trips[idx] = { ...trips[idx], ...patch };
  writeTrips(userId, trips);
  return trips[idx];
}

export function listLocalTripParks(
  userId: string,
  tripId: string,
  allParks: Park[]
): StoredTripPark[] {
  const parkById = new Map(allParks.map((p) => [p.id, p]));
  return readTripParks(userId)
    .filter((tp) => tp.trip_id === tripId)
    .sort((a, b) => a.visit_order - b.visit_order)
    .map((tp) => ({
      ...tp,
      parks: parkById.get(tp.park_id),
    }));
}

export function addLocalTripPark(
  userId: string,
  tripId: string,
  parkId: string,
  allParks: Park[]
): StoredTripPark[] {
  const existing = readTripParks(userId).filter((tp) => tp.trip_id === tripId);
  const entry: StoredTripPark = {
    trip_id: tripId,
    park_id: parkId,
    visit_order: existing.length,
  };
  writeTripParks(userId, [...readTripParks(userId), entry]);
  return listLocalTripParks(userId, tripId, allParks);
}

export function getTripChecklistProgress(
  userId: string,
  tripId: string,
  packId: ChecklistPackId
): string[] {
  const row = readProgress(userId).find((p) => p.tripId === tripId && p.packId === packId);
  return row?.checkedIds ?? [];
}

export function setTripChecklistProgress(
  userId: string,
  tripId: string,
  packId: ChecklistPackId,
  checkedIds: string[]
) {
  const all = readProgress(userId).filter(
    (p) => !(p.tripId === tripId && p.packId === packId)
  );
  all.push({ tripId, packId, checkedIds });
  writeProgress(userId, all);
}

export function toggleChecklistItem(
  userId: string,
  tripId: string,
  packId: ChecklistPackId,
  itemId: string
): string[] {
  const current = getTripChecklistProgress(userId, tripId, packId);
  const next = current.includes(itemId)
    ? current.filter((id) => id !== itemId)
    : [...current, itemId];
  setTripChecklistProgress(userId, tripId, packId, next);
  return next;
}