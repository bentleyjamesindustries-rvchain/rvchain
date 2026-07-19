import { getCardForPlant, KIDS_CARDS, LEGACY_TRAIL_CREATURE_IDS, type KidsCard } from './kidsCards';
import {
  getTrailBadge,
  pickRandomUnownedBadges,
  TRAIL_BADGES,
  type TrailBadge,
} from './trailBadges';

export interface PlantFind {
  plantId: string;
  foundAt: string;
  photoDataUrl: string | null;
}

export type DailyQuestId = 'find_plant' | 'open_pack' | 'view_album';

export interface DailyQuestState {
  dateKey: string; // YYYY-MM-DD local
  completed: Partial<Record<DailyQuestId, boolean>>;
}

export interface KidsProgress {
  finds: Record<string, PlantFind>;
  ownedCardIds: string[];
  ownedBadgeIds: string[];
  trailPacksOpened: number;
  dailyQuests: DailyQuestState | null;
  streakDays: number;
  lastActiveDateKey: string | null;
  pinnedBadgeIds: string[];
  updatedAt: string;
}

const KEY_PREFIX = 'rvchain_kids_progress_';
const LEGACY_SET = new Set<string>(LEGACY_TRAIL_CREATURE_IDS);

function storageKey(userId: string) {
  return `${KEY_PREFIX}${userId}`;
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function createEmptyKidsProgress(): KidsProgress {
  return {
    finds: {},
    ownedCardIds: [],
    ownedBadgeIds: [],
    trailPacksOpened: 0,
    dailyQuests: null,
    streakDays: 0,
    lastActiveDateKey: null,
    pinnedBadgeIds: [],
    updatedAt: new Date().toISOString(),
  };
}

function normalizeProgress(parsed: Partial<KidsProgress>): KidsProgress {
  const ownedCardIds = (Array.isArray(parsed.ownedCardIds) ? parsed.ownedCardIds : []).filter(
    (id) => !LEGACY_SET.has(id)
  );
  let daily = parsed.dailyQuests ?? null;
  const key = todayKey();
  if (!daily || daily.dateKey !== key) {
    daily = { dateKey: key, completed: daily?.dateKey === key ? daily.completed : {} };
  }
  return {
    finds: parsed.finds && typeof parsed.finds === 'object' ? parsed.finds : {},
    ownedCardIds,
    ownedBadgeIds: Array.isArray(parsed.ownedBadgeIds) ? parsed.ownedBadgeIds : [],
    trailPacksOpened: typeof parsed.trailPacksOpened === 'number' ? parsed.trailPacksOpened : 0,
    dailyQuests: daily,
    streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 0,
    lastActiveDateKey:
      typeof parsed.lastActiveDateKey === 'string' ? parsed.lastActiveDateKey : null,
    pinnedBadgeIds: Array.isArray(parsed.pinnedBadgeIds)
      ? parsed.pinnedBadgeIds.slice(0, 3)
      : [],
    updatedAt: parsed.updatedAt ?? new Date().toISOString(),
  };
}

export function loadKidsProgress(userId: string): KidsProgress {
  if (typeof window === 'undefined') return createEmptyKidsProgress();
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return createEmptyKidsProgress();
    return normalizeProgress(JSON.parse(raw) as Partial<KidsProgress>);
  } catch {
    return createEmptyKidsProgress();
  }
}

export function saveKidsProgress(userId: string, progress: KidsProgress): KidsProgress {
  const next = normalizeProgress({
    ...progress,
    updatedAt: new Date().toISOString(),
  });
  localStorage.setItem(storageKey(userId), JSON.stringify(next));
  return next;
}

/** Soft streak: +1 if active yesterday or first activity; reset if gap > 1 day */
export function touchStreak(progress: KidsProgress): KidsProgress {
  const today = todayKey();
  if (progress.lastActiveDateKey === today) return progress;

  let streak = progress.streakDays || 0;
  if (!progress.lastActiveDateKey) {
    streak = 1;
  } else {
    const last = new Date(progress.lastActiveDateKey + 'T12:00:00');
    const now = new Date(today + 'T12:00:00');
    const diffDays = Math.round((now.getTime() - last.getTime()) / 86400000);
    if (diffDays === 1) streak += 1;
    else if (diffDays > 1) streak = 1;
  }

  return {
    ...progress,
    lastActiveDateKey: today,
    streakDays: streak,
  };
}

export function completeDailyQuest(
  progress: KidsProgress,
  questId: DailyQuestId
): KidsProgress {
  const key = todayKey();
  const daily =
    progress.dailyQuests?.dateKey === key
      ? progress.dailyQuests
      : { dateKey: key, completed: {} as Partial<Record<DailyQuestId, boolean>> };

  return touchStreak({
    ...progress,
    dailyQuests: {
      dateKey: key,
      completed: { ...daily.completed, [questId]: true },
    },
  });
}

export function getDailyQuestStatus(progress: KidsProgress): {
  findPlant: boolean;
  openPack: boolean;
  viewAlbum: boolean;
  doneCount: number;
} {
  const key = todayKey();
  const c =
    progress.dailyQuests?.dateKey === key ? progress.dailyQuests.completed : {};
  const findPlant = Boolean(c.find_plant);
  const openPack = Boolean(c.open_pack);
  const viewAlbum = Boolean(c.view_album);
  return {
    findPlant,
    openPack,
    viewAlbum,
    doneCount: [findPlant, openPack, viewAlbum].filter(Boolean).length,
  };
}

export function isPlantFound(progress: KidsProgress, plantId: string): boolean {
  return Boolean(progress.finds[plantId]);
}

export function ownsCard(progress: KidsProgress, cardId: string): boolean {
  return progress.ownedCardIds.includes(cardId);
}

export function ownsBadge(progress: KidsProgress, badgeId: string): boolean {
  return progress.ownedBadgeIds.includes(badgeId);
}

export function getOwnedCards(progress: KidsProgress): KidsCard[] {
  return progress.ownedCardIds
    .map((id) => KIDS_CARDS.find((c) => c.id === id))
    .filter((c): c is KidsCard => Boolean(c));
}

export function getOwnedBadges(progress: KidsProgress): TrailBadge[] {
  return progress.ownedBadgeIds
    .map((id) => getTrailBadge(id))
    .filter((b): b is TrailBadge => Boolean(b))
    .sort((a, b) => a.number - b.number);
}

export function pinBadge(progress: KidsProgress, badgeId: string): KidsProgress {
  if (!progress.ownedBadgeIds.includes(badgeId)) return progress;
  let pinned = [...(progress.pinnedBadgeIds || [])];
  if (pinned.includes(badgeId)) {
    pinned = pinned.filter((id) => id !== badgeId);
  } else {
    pinned = [badgeId, ...pinned.filter((id) => id !== badgeId)].slice(0, 3);
  }
  return { ...progress, pinnedBadgeIds: pinned };
}

export function trailLevel(progress: KidsProgress): {
  level: number;
  name: string;
  pct: number;
} {
  const score =
    Object.keys(progress.finds).length * 10 + progress.ownedBadgeIds.length * 5;
  const levels = [
    { level: 1, name: 'Trail Cub', min: 0 },
    { level: 2, name: 'Path Finder', min: 30 },
    { level: 3, name: 'Badge Hunter', min: 80 },
    { level: 4, name: 'Trail Ace', min: 150 },
    { level: 5, name: 'Legend Scout', min: 250 },
  ];
  let cur = levels[0];
  let next = levels[1];
  for (let i = 0; i < levels.length; i++) {
    if (score >= levels[i].min) {
      cur = levels[i];
      next = levels[i + 1] ?? levels[i];
    }
  }
  const span = Math.max(1, next.min - cur.min);
  const pct =
    cur.level === 5 ? 100 : Math.min(100, ((score - cur.min) / span) * 100);
  return { level: cur.level, name: cur.name, pct };
}

/** Mark plant found with optional photo; awards matching plant Field Sticker. */
export function recordPlantFind(
  progress: KidsProgress,
  plantId: string,
  photoDataUrl: string | null
): { progress: KidsProgress; newCardId: string | null; alreadyFound: boolean } {
  if (progress.finds[plantId]) {
    return { progress, newCardId: null, alreadyFound: true };
  }

  const finds = {
    ...progress.finds,
    [plantId]: {
      plantId,
      foundAt: new Date().toISOString(),
      photoDataUrl,
    },
  };

  let ownedCardIds = [...progress.ownedCardIds];
  let newCardId: string | null = null;
  const card = getCardForPlant(plantId);
  if (card && !ownedCardIds.includes(card.id)) {
    ownedCardIds = [...ownedCardIds, card.id];
    newCardId = card.id;
  }

  let ownedBadgeIds = [...progress.ownedBadgeIds];
  const findCount = Object.keys(finds).length;
  if (findCount > 0 && findCount % 3 === 0) {
    const bonus = pickRandomUnownedBadges(ownedBadgeIds, 1);
    if (bonus[0]) ownedBadgeIds = [...ownedBadgeIds, bonus[0].id];
  }

  let next: KidsProgress = {
    ...progress,
    finds,
    ownedCardIds,
    ownedBadgeIds,
  };
  next = completeDailyQuest(next, 'find_plant');

  return {
    progress: next,
    newCardId,
    alreadyFound: false,
  };
}

export const PACK_ODDS_LABEL =
  'Drop odds (approx): Common ~55% · Uncommon ~28% · Rare ~14% · Legendary ~3% · 1–3 badges per Drop';

/**
 * Trail Drop: awards 1–3 Trail Badges.
 * Requires at least one plant find; max 8 free packs.
 */
export function openTrailPack(progress: KidsProgress): {
  progress: KidsProgress;
  awarded: TrailBadge[];
  error?: string;
} {
  const findCount = Object.keys(progress.finds).length;
  if (findCount < 1) {
    return {
      progress,
      awarded: [],
      error: 'Find at least one plant on the scavenger hunt first!',
    };
  }
  if (progress.trailPacksOpened >= 8) {
    return {
      progress,
      awarded: [],
      error: 'You opened all free Trail Drops for now. Keep collecting!',
    };
  }

  const awarded = pickRandomUnownedBadges(progress.ownedBadgeIds, 3);
  if (awarded.length === 0) {
    return {
      progress,
      awarded: [],
      error: 'Your Trail Badge vault is full — legendary hunter!',
    };
  }

  let next: KidsProgress = {
    ...progress,
    ownedBadgeIds: [...progress.ownedBadgeIds, ...awarded.map((b) => b.id)],
    trailPacksOpened: progress.trailPacksOpened + 1,
  };
  next = completeDailyQuest(next, 'open_pack');

  return {
    progress: next,
    awarded,
  };
}

export function badgeCollectionStats(progress: KidsProgress) {
  return {
    owned: progress.ownedBadgeIds.length,
    total: TRAIL_BADGES.length,
  };
}

export function stickerCollectionStats(progress: KidsProgress) {
  return {
    owned: getOwnedCards(progress).length,
    total: KIDS_CARDS.length,
  };
}
