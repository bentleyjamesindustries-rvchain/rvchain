import { Park } from './parks';

export interface StoredTrip {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface StoredTripPark {
  trip_id: string;
  park_id: string;
  visit_order: number;
  parks?: Park;
}

const tripsKey = (userId: string) => `rvchain_trips_${userId}`;
const parksKey = (userId: string) => `rvchain_trip_parks_${userId}`;

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
  };
  const trips = readTrips(userId);
  writeTrips(userId, [trip, ...trips]);
  return trip;
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