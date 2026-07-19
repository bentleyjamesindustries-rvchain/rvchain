import { getCardForPlant, KIDS_CARDS, type KidsCard } from './kidsCards';
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

export interface KidsProgress {
  finds: Record<string, PlantFind>;
  ownedCardIds: string[];
  ownedBadgeIds: string[];
  trailPacksOpened: number;
  updatedAt: string;
}

const KEY_PREFIX = 'rvchain_kids_progress_';

function storageKey(userId: string) {
  return `${KEY_PREFIX}${userId}`;
}

export function createEmptyKidsProgress(): KidsProgress {
  return {
    finds: {},
    ownedCardIds: [],
    ownedBadgeIds: [],
    trailPacksOpened: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function loadKidsProgress(userId: string): KidsProgress {
  if (typeof window === 'undefined') return createEmptyKidsProgress();
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return createEmptyKidsProgress();
    const parsed = JSON.parse(raw) as Partial<KidsProgress>;
    return {
      finds: parsed.finds && typeof parsed.finds === 'object' ? parsed.finds : {},
      ownedCardIds: Array.isArray(parsed.ownedCardIds) ? parsed.ownedCardIds : [],
      ownedBadgeIds: Array.isArray(parsed.ownedBadgeIds) ? parsed.ownedBadgeIds : [],
      trailPacksOpened: typeof parsed.trailPacksOpened === 'number' ? parsed.trailPacksOpened : 0,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return createEmptyKidsProgress();
  }
}

export function saveKidsProgress(userId: string, progress: KidsProgress): KidsProgress {
  const next: KidsProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(storageKey(userId), JSON.stringify(next));
  return next;
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

/** Mark plant found with optional photo; awards matching plant card. */
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

  // Milestone: every 3 plant finds, grant a common/uncommon badge chance
  let ownedBadgeIds = [...progress.ownedBadgeIds];
  const findCount = Object.keys(finds).length;
  if (findCount > 0 && findCount % 3 === 0) {
    const bonus = pickRandomUnownedBadges(ownedBadgeIds, 1);
    if (bonus[0]) ownedBadgeIds = [...ownedBadgeIds, bonus[0].id];
  }

  return {
    progress: {
      ...progress,
      finds,
      ownedCardIds,
      ownedBadgeIds,
    },
    newCardId,
    alreadyFound: false,
  };
}

/**
 * Trail pack: awards 1–3 Trail Badges (not plant cards).
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
      error: 'You opened all free trail packs for now. Keep collecting!',
    };
  }

  const awarded = pickRandomUnownedBadges(progress.ownedBadgeIds, 3);
  if (awarded.length === 0) {
    return {
      progress,
      awarded: [],
      error: 'Your Trail Badge album is full — legendary hunter!',
    };
  }

  return {
    progress: {
      ...progress,
      ownedBadgeIds: [...progress.ownedBadgeIds, ...awarded.map((b) => b.id)],
      trailPacksOpened: progress.trailPacksOpened + 1,
    },
    awarded,
  };
}

export function badgeCollectionStats(progress: KidsProgress) {
  return {
    owned: progress.ownedBadgeIds.length,
    total: TRAIL_BADGES.length,
  };
}
