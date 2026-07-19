import { KIDS_PLANTS, type PlantRarity } from './kidsPlants';

export type CardRarity = PlantRarity;

export interface KidsCard {
  id: string;
  name: string;
  emoji: string;
  rarity: CardRarity;
  /** Matching plant id when earned from scavenger hunt */
  plantId: string | null;
  type: 'plant' | 'trail';
  description: string;
  powerLabel: string;
}

const RARITY_POWER: Record<CardRarity, string> = {
  common: 'Trail Scout',
  uncommon: 'Field Explorer',
  rare: 'Nature Ranger',
  legendary: 'Legend of the Road',
};

/** Field Stickers — plant cards from scavenger hunts only (no legacy trail creatures) */
export const KIDS_CARDS: KidsCard[] = KIDS_PLANTS.map((plant) => ({
  id: `card-${plant.id}`,
  name: plant.commonName,
  emoji: plant.emoji,
  rarity: plant.rarity,
  plantId: plant.id,
  type: 'plant' as const,
  description: plant.funFact,
  powerLabel: RARITY_POWER[plant.rarity],
}));

/** Removed emoji trail creatures — use Trail Badges art set instead */
export const LEGACY_TRAIL_CREATURE_IDS = [
  'card-campfire-fox',
  'card-stargazer-owl',
  'card-rv-roadrunner',
  'card-compass-chipmunk',
] as const;

const CARD_MAP = new Map(KIDS_CARDS.map((c) => [c.id, c]));

export function getKidsCard(id: string): KidsCard | undefined {
  return CARD_MAP.get(id);
}

export function getCardForPlant(plantId: string): KidsCard | undefined {
  return KIDS_CARDS.find((c) => c.plantId === plantId);
}

export function getRarityColor(rarity: CardRarity): string {
  switch (rarity) {
    case 'common':
      return '#94a3b8';
    case 'uncommon':
      return '#4ade80';
    case 'rare':
      return '#38bdf8';
    case 'legendary':
      return '#fbbf24';
  }
}

export function getRarityLabel(rarity: CardRarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}
