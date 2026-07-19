import { getCardForPlant, KIDS_CARDS, type KidsCard } from './kidsCards';

export interface PlantFind {
  plantId: string;
  foundAt: string;
  photoDataUrl: string | null;
}

export interface KidsProgress {
  finds: Record<string, PlantFind>;
  ownedCardIds: string[];
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
    trailPacksOpened: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function loadKidsProgress(userId: string): KidsProgress {
  if (typeof window === 'undefined') return createEmptyKidsProgress();
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return createEmptyKidsProgress();
    const parsed = JSON.parse(raw) as KidsProgress;
    return {
      finds: parsed.finds && typeof parsed.finds === 'object' ? parsed.finds : {},
      ownedCardIds: Array.isArray(parsed.ownedCardIds) ? parsed.ownedCardIds : [],
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

export function getOwnedCards(progress: KidsProgress): KidsCard[] {
  return progress.ownedCardIds
    .map((id) => KIDS_CARDS.find((c) => c.id === id))
    .filter((c): c is KidsCard => Boolean(c));
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

  return {
    progress: {
      ...progress,
      finds,
      ownedCardIds,
    },
    newCardId,
    alreadyFound: false,
  };
}

/** Demo trail pack: award 1–3 random unowned common/uncommon cards (not legendary). */
export function openTrailPack(progress: KidsProgress): {
  progress: KidsProgress;
  awarded: KidsCard[];
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
  if (progress.trailPacksOpened >= 5) {
    return {
      progress,
      awarded: [],
      error: 'You opened all free trail packs for now. Keep hunting plants!',
    };
  }

  const pool = KIDS_CARDS.filter(
    (c) =>
      !progress.ownedCardIds.includes(c.id) &&
      (c.rarity === 'common' || c.rarity === 'uncommon' || c.type === 'trail')
  );
  if (pool.length === 0) {
    return {
      progress,
      awarded: [],
      error: 'Your album is almost full — hunt rare plants for more cards!',
    };
  }

  const count = Math.min(3, pool.length);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const awarded = shuffled.slice(0, count);
  const ownedCardIds = [...progress.ownedCardIds, ...awarded.map((c) => c.id)];

  return {
    progress: {
      ...progress,
      ownedCardIds,
      trailPacksOpened: progress.trailPacksOpened + 1,
    },
    awarded,
  };
}
