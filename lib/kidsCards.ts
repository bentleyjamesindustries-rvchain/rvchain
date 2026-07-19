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

/** One collectible card per plant + a few bonus trail creature cards */
export const KIDS_CARDS: KidsCard[] = [
  ...KIDS_PLANTS.map((plant) => ({
    id: `card-${plant.id}`,
    name: plant.commonName,
    emoji: plant.emoji,
    rarity: plant.rarity,
    plantId: plant.id,
    type: 'plant' as const,
    description: plant.funFact,
    powerLabel: RARITY_POWER[plant.rarity],
  })),
  {
    id: 'card-campfire-fox',
    name: 'Campfire Fox',
    emoji: '🦊',
    rarity: 'rare',
    plantId: null,
    type: 'trail',
    description: 'A clever trail buddy who loves marshmallow stories.',
    powerLabel: 'Nature Ranger',
  },
  {
    id: 'card-stargazer-owl',
    name: 'Stargazer Owl',
    emoji: '🦉',
    rarity: 'rare',
    plantId: null,
    type: 'trail',
    description: 'Keeps watch under the big sky on quiet nights.',
    powerLabel: 'Nature Ranger',
  },
  {
    id: 'card-rv-roadrunner',
    name: 'RV Roadrunner',
    emoji: '🐦',
    rarity: 'legendary',
    plantId: null,
    type: 'trail',
    description: 'Beep-beep! Fastest legend on the interstate trail.',
    powerLabel: 'Legend of the Road',
  },
  {
    id: 'card-compass-chipmunk',
    name: 'Compass Chipmunk',
    emoji: '🐿️',
    rarity: 'uncommon',
    plantId: null,
    type: 'trail',
    description: 'Never loses the way back to base camp.',
    powerLabel: 'Field Explorer',
  },
];

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
