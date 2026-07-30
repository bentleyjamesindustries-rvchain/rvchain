import { PASSPORT_STATES, type StateStamp } from './explorerPassport';
import { stateCodeFromLatLng } from './geoState';

export type VehicleType =
  | 'camper'
  | 'offroad-truck'
  | 'atv'
  | 'dirt-bike'
  | 'snowmobile'
  | 'other';

export const VEHICLE_TYPES: { id: VehicleType; label: string; emoji: string }[] = [
  { id: 'camper', label: 'Camper / RV', emoji: '🚐' },
  { id: 'offroad-truck', label: 'Off-road truck', emoji: '🛻' },
  { id: 'atv', label: 'ATV / UTV', emoji: '🏎️' },
  { id: 'dirt-bike', label: 'Dirt bike', emoji: '🏍️' },
  { id: 'snowmobile', label: 'Snowmobile', emoji: '🏂' },
  { id: 'other', label: 'Other', emoji: '🏕️' },
];

export interface TrailSession {
  id: string;
  vehicleType: VehicleType;
  startedAt: string;
  endedAt: string;
  note: string;
  stateCode: string | null;
  lat: number | null;
  lng: number | null;
  photoDataUrl: string | null;
  miles: number | null;
}

export interface TrailBadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** Return true if earned given all sessions */
  check: (sessions: TrailSession[]) => boolean;
}

const storageKey = (userId: string) => `rvchain_trail_log_v1_${userId}`;

function read(userId: string): TrailSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TrailSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(userId: string, sessions: TrailSession[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey(userId), JSON.stringify(sessions.slice(0, 200)));
}

export function listTrailSessions(userId: string): TrailSession[] {
  return read(userId).sort(
    (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime()
  );
}

export function vehicleLabel(type: VehicleType): string {
  return VEHICLE_TYPES.find((v) => v.id === type)?.label ?? type;
}

export function vehicleEmoji(type: VehicleType): string {
  return VEHICLE_TYPES.find((v) => v.id === type)?.emoji ?? '🏕️';
}

export async function completeTrailSession(
  userId: string,
  input: {
    vehicleType: VehicleType;
    note: string;
    lat: number | null;
    lng: number | null;
    photoDataUrl: string | null;
    startedAt: string;
    miles?: number | null;
  }
): Promise<TrailSession> {
  let stateCode: string | null = null;
  if (input.lat != null && input.lng != null) {
    try {
      stateCode = stateCodeFromLatLng(input.lat, input.lng);
    } catch {
      stateCode = null;
    }
  }

  const session: TrailSession = {
    id: `trail-${Date.now()}`,
    vehicleType: input.vehicleType,
    startedAt: input.startedAt,
    endedAt: new Date().toISOString(),
    note: input.note.trim(),
    stateCode,
    lat: input.lat,
    lng: input.lng,
    photoDataUrl: input.photoDataUrl,
    miles: input.miles ?? null,
  };

  const all = read(userId);
  write(userId, [session, ...all]);
  return session;
}

export function deleteTrailSession(userId: string, sessionId: string) {
  write(
    userId,
    read(userId).filter((s) => s.id !== sessionId)
  );
}

export function getTrailPassportStamps(userId: string): StateStamp[] {
  const counts = new Map<string, { n: number; last: string | null }>();
  for (const s of read(userId)) {
    const code = s.stateCode?.toUpperCase();
    if (!code) continue;
    const prev = counts.get(code) || { n: 0, last: null };
    const last =
      !prev.last || (s.endedAt && s.endedAt > prev.last) ? s.endedAt : prev.last;
    counts.set(code, { n: prev.n + 1, last });
  }

  return PASSPORT_STATES.map(({ code, name }) => {
    const hit = counts.get(code);
    return {
      code,
      name,
      findCount: hit?.n ?? 0,
      lastFoundAt: hit?.last ?? null,
      stamped: Boolean(hit && hit.n > 0),
    };
  });
}

export function trailPassportSummary(userId: string) {
  const stamps = getTrailPassportStamps(userId);
  const stamped = stamps.filter((s) => s.stamped).length;
  const withGps = read(userId).filter((s) => s.lat != null && s.lng != null).length;
  const total = PASSPORT_STATES.length;
  return {
    stamped,
    total,
    withGps,
    pct: total ? Math.round((stamped / total) * 100) : 0,
  };
}

export const TRAIL_LOG_BADGES: TrailBadgeDef[] = [
  {
    id: 'first-log',
    name: 'First log',
    emoji: '🏁',
    description: 'Complete your first ride or trip log.',
    check: (s) => s.length >= 1,
  },
  {
    id: 'atv-rider',
    name: 'ATV day',
    emoji: '🛻',
    description: 'Log a session on an ATV or UTV.',
    check: (s) => s.some((x) => x.vehicleType === 'atv'),
  },
  {
    id: 'dirt-rider',
    name: 'Dirt day',
    emoji: '🏍️',
    description: 'Log a dirt bike session.',
    check: (s) => s.some((x) => x.vehicleType === 'dirt-bike'),
  },
  {
    id: 'snow-rider',
    name: 'Snow day',
    emoji: '❄️',
    description: 'Log a snowmobile session.',
    check: (s) => s.some((x) => x.vehicleType === 'snowmobile'),
  },
  {
    id: 'truck-trail',
    name: 'Truck trail',
    emoji: '🔧',
    description: 'Log an off-road truck session.',
    check: (s) => s.some((x) => x.vehicleType === 'offroad-truck'),
  },
  {
    id: 'road-trip',
    name: 'Road trip',
    emoji: '🚐',
    description: 'Log a camper / RV session.',
    check: (s) => s.some((x) => x.vehicleType === 'camper'),
  },
  {
    id: 'multi-rig',
    name: 'Multi-rig',
    emoji: '🎯',
    description: 'Log sessions with 3 different vehicle types.',
    check: (s) => new Set(s.map((x) => x.vehicleType)).size >= 3,
  },
  {
    id: 'five-sessions',
    name: 'Weekend warrior',
    emoji: '⭐',
    description: 'Complete 5 trail logs.',
    check: (s) => s.length >= 5,
  },
  {
    id: 'state-hopper',
    name: 'State hopper',
    emoji: '🗺️',
    description: 'Stamp 3 different states with GPS logs.',
    check: (s) =>
      new Set(s.map((x) => x.stateCode).filter(Boolean)).size >= 3,
  },
  {
    id: 'photo-log',
    name: 'Trail camera',
    emoji: '📸',
    description: 'Attach a photo to a log.',
    check: (s) => s.some((x) => Boolean(x.photoDataUrl)),
  },
];

export function getEarnedTrailBadges(userId: string) {
  const sessions = read(userId);
  return TRAIL_LOG_BADGES.filter((b) => b.check(sessions));
}

export function trailLogStats(userId: string) {
  const sessions = listTrailSessions(userId);
  const passport = trailPassportSummary(userId);
  const badges = getEarnedTrailBadges(userId);
  const vehicles = new Set(sessions.map((s) => s.vehicleType));
  return {
    sessions: sessions.length,
    vehiclesUsed: vehicles.size,
    badges: badges.length,
    badgeTotal: TRAIL_LOG_BADGES.length,
    states: passport.stamped,
    statesTotal: passport.total,
  };
}
