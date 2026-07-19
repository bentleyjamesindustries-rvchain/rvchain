export type PlantRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export type PlantRegion =
  | 'nationwide'
  | 'west'
  | 'southwest'
  | 'midwest'
  | 'southeast'
  | 'northeast'
  | 'northwest'
  | 'mountain';

export interface KidsPlant {
  id: string;
  name: string;
  commonName: string;
  emoji: string;
  regions: PlantRegion[];
  rarity: PlantRarity;
  habitat: string;
  funFact: string;
  lookFor: string;
  safetyNote: string;
}

/** US state → broad plant region for “local trail” filtering */
export const STATE_TO_REGION: Record<string, PlantRegion> = {
  CA: 'west', OR: 'northwest', WA: 'northwest', NV: 'west', HI: 'west', AK: 'northwest',
  AZ: 'southwest', NM: 'southwest', TX: 'southwest', OK: 'southwest',
  CO: 'mountain', UT: 'mountain', WY: 'mountain', MT: 'mountain', ID: 'mountain',
  ND: 'midwest', SD: 'midwest', NE: 'midwest', KS: 'midwest', MN: 'midwest',
  IA: 'midwest', MO: 'midwest', WI: 'midwest', IL: 'midwest', IN: 'midwest',
  MI: 'midwest', OH: 'midwest',
  FL: 'southeast', GA: 'southeast', AL: 'southeast', MS: 'southeast', LA: 'southeast',
  AR: 'southeast', TN: 'southeast', KY: 'southeast', SC: 'southeast', NC: 'southeast',
  VA: 'southeast', WV: 'southeast',
  ME: 'northeast', NH: 'northeast', VT: 'northeast', MA: 'northeast', RI: 'northeast',
  CT: 'northeast', NY: 'northeast', NJ: 'northeast', PA: 'northeast', DE: 'northeast',
  MD: 'northeast', DC: 'northeast',
};

export const KIDS_PLANTS: KidsPlant[] = [
  {
    id: 'dandelion',
    name: 'Taraxacum',
    commonName: 'Dandelion',
    emoji: '🌼',
    regions: ['nationwide'],
    rarity: 'common',
    habitat: 'Lawns, trail edges, campground grass',
    funFact: 'Every fluffy seed head is a tiny parachute fleet!',
    lookFor: 'Bright yellow flower or white puffball seed head',
    safetyNote: 'Look only — never put wild plants in your mouth.',
  },
  {
    id: 'pine-cone',
    name: 'Pinus',
    commonName: 'Pine cone',
    emoji: '🌲',
    regions: ['nationwide', 'northwest', 'mountain', 'northeast'],
    rarity: 'common',
    habitat: 'Under pine and conifer trees',
    funFact: 'Cones open and close with weather like nature’s weather station.',
    lookFor: 'Woody cone scales on the ground or on evergreen trees',
    safetyNote: 'Watch for sap — it is sticky but not a snack.',
  },
  {
    id: 'acorn',
    name: 'Quercus',
    commonName: 'Acorn',
    emoji: '🌰',
    regions: ['nationwide', 'midwest', 'southeast', 'northeast'],
    rarity: 'common',
    habitat: 'Under oak trees in parks and forests',
    funFact: 'Squirrels bury acorns and sometimes forget — new oaks grow!',
    lookFor: 'Nut with a little cup-shaped cap',
    safetyNote: 'Raw acorns are not for eating. Photos only!',
  },
  {
    id: 'cattail',
    name: 'Typha',
    commonName: 'Cattail',
    emoji: '🌿',
    regions: ['nationwide', 'midwest', 'northeast', 'southeast'],
    rarity: 'common',
    habitat: 'Marsh edges, ponds, wet ditches',
    funFact: 'The brown top looks like a hot dog on a stick!',
    lookFor: 'Tall reeds with a brown sausage-shaped top',
    safetyNote: 'Stay on solid ground near water — no wading alone.',
  },
  {
    id: 'sagebrush',
    name: 'Artemisia tridentata',
    commonName: 'Sagebrush',
    emoji: '🪴',
    regions: ['west', 'southwest', 'mountain'],
    rarity: 'uncommon',
    habitat: 'Open dry flats and desert plateaus',
    funFact: 'It smells spicy-sweet after rain — desert perfume!',
    lookFor: 'Silvery-green bushy shrub with three-toothed leaves',
    safetyNote: 'Look with eyes and nose — leave the plant standing.',
  },
  {
    id: 'saguaro',
    name: 'Carnegiea gigantea',
    commonName: 'Saguaro cactus',
    emoji: '🌵',
    regions: ['southwest'],
    rarity: 'rare',
    habitat: 'Sonoran Desert (AZ and nearby)',
    funFact: 'A big saguaro can live longer than a great-grandparent!',
    lookFor: 'Tall green cactus with arms reaching up',
    safetyNote: 'Never touch cactus spines. Stay on the trail.',
  },
  {
    id: 'prickly-pear',
    name: 'Opuntia',
    commonName: 'Prickly pear',
    emoji: '🟢',
    regions: ['southwest', 'west', 'southeast'],
    rarity: 'uncommon',
    habitat: 'Dry open ground, rocky slopes',
    funFact: 'Its pads look like green pancakes stacked sideways!',
    lookFor: 'Flat green pads with spines or tiny hair-like spines',
    safetyNote: 'Spines and glochids hurt — look only, no touching.',
  },
  {
    id: 'yucca',
    name: 'Yucca',
    commonName: 'Yucca',
    emoji: '⚔️',
    regions: ['southwest', 'west', 'mountain'],
    rarity: 'uncommon',
    habitat: 'Dry hills and desert scrub',
    funFact: 'Yucca and moths are a famous plant–insect team.',
    lookFor: 'Spiky sword leaves in a rosette, sometimes a tall flower spike',
    safetyNote: 'Sharp leaf tips — keep a safe distance for photos.',
  },
  {
    id: 'maple-leaf',
    name: 'Acer',
    commonName: 'Maple leaf',
    emoji: '🍁',
    regions: ['northeast', 'midwest', 'northwest'],
    rarity: 'common',
    habitat: 'Woods, campground shade trees, fall color trails',
    funFact: 'Canada’s flag star is a maple leaf!',
    lookFor: 'Hand-shaped leaf with pointed lobes',
    safetyNote: 'Collect fallen leaves only if a parent says it is OK.',
  },
  {
    id: 'fern',
    name: 'Pteridophyta',
    commonName: 'Fern frond',
    emoji: '🪴',
    regions: ['northwest', 'northeast', 'southeast', 'midwest'],
    rarity: 'common',
    habitat: 'Shady moist forest floors',
    funFact: 'Ferns are older than dinosaurs’ favorite snacks!',
    lookFor: 'Feathery green leaves unfurling like a fiddlehead',
    safetyNote: 'Stay on the path so tiny forest plants stay safe.',
  },
  {
    id: 'lichen',
    name: 'Lichen',
    commonName: 'Rock lichen',
    emoji: '🪨',
    regions: ['nationwide', 'mountain', 'northeast', 'northwest'],
    rarity: 'uncommon',
    habitat: 'Rocks, old logs, trail markers',
    funFact: 'Lichen is a plant + fungus buddy system!',
    lookFor: 'Crusty or leafy patches of green, orange, or gray on rock',
    safetyNote: 'Do not scrape lichen off rocks — photo it instead.',
  },
  {
    id: 'sunflower',
    name: 'Helianthus',
    commonName: 'Wild sunflower',
    emoji: '🌻',
    regions: ['midwest', 'southwest', 'west'],
    rarity: 'uncommon',
    habitat: 'Roadsides, open prairies, sunny fields',
    funFact: 'Young sunflowers can track the sun across the sky.',
    lookFor: 'Tall yellow daisy-like flower with a dark center',
    safetyNote: 'Stay away from busy roads when hunting sunflowers.',
  },
  {
    id: 'bluebonnet',
    name: 'Lupinus texensis',
    commonName: 'Bluebonnet',
    emoji: '💙',
    regions: ['southwest'],
    rarity: 'rare',
    habitat: 'Texas hills and spring meadows',
    funFact: 'Texas’ state flower paints fields blue in spring!',
    lookFor: 'Spikes of blue pea-like flowers (in season)',
    safetyNote: 'Never pick wildflowers in parks — snap a photo!',
  },
  {
    id: 'redwood',
    name: 'Sequoia / Sequoia sempervirens',
    commonName: 'Redwood bark',
    emoji: '🪵',
    regions: ['west'],
    rarity: 'legendary',
    habitat: 'Coastal California redwood parks',
    funFact: 'Some redwoods are taller than the Statue of Liberty!',
    lookFor: 'Cinnamon-red fibrous bark on a giant tree',
    safetyNote: 'Stay on boardwalks and trails around giant trees.',
  },
  {
    id: 'aspen',
    name: 'Populus tremuloides',
    commonName: 'Aspen grove',
    emoji: '💛',
    regions: ['mountain', 'west', 'midwest'],
    rarity: 'rare',
    habitat: 'Mountain slopes and high meadows',
    funFact: 'A whole grove can be one huge connected tree!',
    lookFor: 'White bark with black scars; shimmering round leaves',
    safetyNote: 'Enjoy the quaking leaves from the trail.',
  },
  {
    id: 'mushroom-shelf',
    name: 'Polypore',
    commonName: 'Shelf fungus',
    emoji: '🍄',
    regions: ['nationwide', 'northwest', 'northeast', 'southeast'],
    rarity: 'uncommon',
    habitat: 'Dead logs and tree trunks in forests',
    funFact: 'Shelf fungi help recycle old wood into forest soil.',
    lookFor: 'Shelf- or fan-shaped growth on wood (not a toadstool cap)',
    safetyNote: 'Never touch or taste wild mushrooms — adult eyes only.',
  },
];

const PLANT_MAP = new Map(KIDS_PLANTS.map((p) => [p.id, p]));

export function getKidsPlant(id: string): KidsPlant | undefined {
  return PLANT_MAP.get(id);
}

export function getPlantsForTrail(stateCode?: string | null): KidsPlant[] {
  const region = stateCode ? STATE_TO_REGION[stateCode.toUpperCase()] : undefined;
  if (!region) {
    return KIDS_PLANTS.filter(
      (p) => p.regions.includes('nationwide') || p.rarity === 'common'
    ).slice(0, 12);
  }
  const local = KIDS_PLANTS.filter(
    (p) => p.regions.includes('nationwide') || p.regions.includes(region)
  );
  return local.length >= 6 ? local : KIDS_PLANTS.slice(0, 12);
}
