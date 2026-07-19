export type KidsGameId = 'trail-run' | 'marshmallow-catch' | 'tree-climb';

export interface KidsGameScores {
  highScores: Partial<Record<KidsGameId, number>>;
  played: Partial<Record<KidsGameId, boolean>>;
  updatedAt: string;
}

const KEY_PREFIX = 'rvchain_kids_games_';

function storageKey(userId: string) {
  return `${KEY_PREFIX}${userId}`;
}

export function createEmptyGameScores(): KidsGameScores {
  return {
    highScores: {},
    played: {},
    updatedAt: new Date().toISOString(),
  };
}

export function loadGameScores(userId: string): KidsGameScores {
  if (typeof window === 'undefined') return createEmptyGameScores();
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return createEmptyGameScores();
    const parsed = JSON.parse(raw) as Partial<KidsGameScores>;
    return {
      highScores:
        parsed.highScores && typeof parsed.highScores === 'object' ? parsed.highScores : {},
      played: parsed.played && typeof parsed.played === 'object' ? parsed.played : {},
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return createEmptyGameScores();
  }
}

export function saveGameScores(userId: string, scores: KidsGameScores): KidsGameScores {
  const next: KidsGameScores = {
    ...scores,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(storageKey(userId), JSON.stringify(next));
  return next;
}

/** Returns new high score if improved, else existing best. */
export function saveHighScore(
  userId: string,
  gameId: KidsGameId,
  score: number
): { scores: KidsGameScores; isNewBest: boolean; best: number } {
  const scores = loadGameScores(userId);
  const prev = scores.highScores[gameId] ?? 0;
  const isNewBest = score > prev;
  const best = isNewBest ? score : prev;
  const next: KidsGameScores = {
    ...scores,
    highScores: {
      ...scores.highScores,
      [gameId]: best,
    },
    played: {
      ...scores.played,
      [gameId]: true,
    },
  };
  return {
    scores: saveGameScores(userId, next),
    isNewBest,
    best,
  };
}

export function getHighScore(userId: string, gameId: KidsGameId): number {
  return loadGameScores(userId).highScores[gameId] ?? 0;
}
