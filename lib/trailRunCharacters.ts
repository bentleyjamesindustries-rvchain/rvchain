export type TrailRunCharacterId = 'maple-fox' | 'bun-bunny' | 'cocoa-bear';

export interface TrailRunPalette {
  body: string;
  bodyDark: string;
  belly: string;
  ear: string;
  earInner: string;
  nose: string;
  cheek: string;
  accent?: string;
}

export interface TrailRunCharacter {
  id: TrailRunCharacterId;
  name: string;
  tagline: string;
  emoji: string;
  /** Extra draw features */
  style: 'fox' | 'bunny' | 'bear';
  palette: TrailRunPalette;
}

export const TRAIL_RUN_CHARACTERS: TrailRunCharacter[] = [
  {
    id: 'maple-fox',
    name: 'Maple',
    tagline: 'Fluffy trail fox',
    emoji: '🦊',
    style: 'fox',
    palette: {
      body: '#fb923c',
      bodyDark: '#ea580c',
      belly: '#ffedd5',
      ear: '#f97316',
      earInner: '#fda4af',
      nose: '#9f1239',
      cheek: 'rgba(251, 113, 133, 0.5)',
      accent: '#fdba74',
    },
  },
  {
    id: 'bun-bunny',
    name: 'Bun',
    tagline: 'Pudgy hop bunny',
    emoji: '🐰',
    style: 'bunny',
    palette: {
      body: '#f5f5f4',
      bodyDark: '#d6d3d1',
      belly: '#ffffff',
      ear: '#e7e5e4',
      earInner: '#fda4af',
      nose: '#e11d48',
      cheek: 'rgba(251, 113, 133, 0.45)',
      accent: '#fecdd3',
    },
  },
  {
    id: 'cocoa-bear',
    name: 'Cocoa',
    tagline: 'Round camp bear',
    emoji: '🐻',
    style: 'bear',
    palette: {
      body: '#a16207',
      bodyDark: '#78350f',
      belly: '#fde68a',
      ear: '#92400e',
      earInner: '#d97706',
      nose: '#1c1917',
      cheek: 'rgba(251, 146, 60, 0.4)',
      accent: '#fbbf24',
    },
  },
];

const KEY_PREFIX = 'rvchain_trail_run_char_';

export function getTrailRunCharacter(id: TrailRunCharacterId): TrailRunCharacter {
  return TRAIL_RUN_CHARACTERS.find((c) => c.id === id) ?? TRAIL_RUN_CHARACTERS[0];
}

export function loadTrailRunCharacter(userId: string): TrailRunCharacterId {
  if (typeof window === 'undefined') return 'maple-fox';
  try {
    const raw = localStorage.getItem(KEY_PREFIX + userId);
    if (raw && TRAIL_RUN_CHARACTERS.some((c) => c.id === raw)) {
      return raw as TrailRunCharacterId;
    }
  } catch {
    /* ignore */
  }
  return 'maple-fox';
}

export function saveTrailRunCharacter(userId: string, id: TrailRunCharacterId): void {
  try {
    localStorage.setItem(KEY_PREFIX + userId, id);
  } catch {
    /* ignore */
  }
}
