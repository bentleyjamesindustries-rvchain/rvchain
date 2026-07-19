export type TrailBadgeRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type TrailBadgeTheme = 'wildlife' | 'landscape' | 'camp' | 'legendary';

export interface TrailBadge {
  id: string;
  number: number;
  name: string;
  rarity: TrailBadgeRarity;
  theme: TrailBadgeTheme;
  description: string;
  /** Public path under /kids/badges/ */
  imageSrc: string;
  /** Prompt subject for art generation */
  artSubject: string;
}

function badge(
  number: number,
  slug: string,
  name: string,
  rarity: TrailBadgeRarity,
  theme: TrailBadgeTheme,
  description: string,
  artSubject: string
): TrailBadge {
  const id = `badge-${String(number).padStart(3, '0')}-${slug}`;
  return {
    id,
    number,
    name,
    rarity,
    theme,
    description,
    imageSrc: `/kids/badges/${id}.png`,
    artSubject,
  };
}

/** 50 Trail Badges — camping wildlife, landscapes, camp life, legendaries */
export const TRAIL_BADGES: TrailBadge[] = [
  // Wildlife (18) — 001–018
  badge(1, 'campfire-fox', 'Campfire Fox', 'common', 'wildlife', 'A clever friend who loves marshmallow stories.', 'cute semi-realistic red fox sitting by a warm campfire glow'),
  badge(2, 'chipmunk-scout', 'Chipmunk Scout', 'common', 'wildlife', 'Cheeks full of trail mix and courage.', 'cute semi-realistic chipmunk with full cheeks on a log'),
  badge(3, 'trail-rabbit', 'Trail Rabbit', 'common', 'wildlife', 'Hopping just ahead on every morning walk.', 'cute semi-realistic rabbit on a forest path at dawn'),
  badge(4, 'lake-trout', 'Lake Trout', 'common', 'wildlife', 'Silver flash under quiet water.', 'cute semi-realistic trout leaping from a clear mountain lake'),
  badge(5, 'forest-deer', 'Forest Deer', 'common', 'wildlife', 'Soft steps between the pines.', 'cute semi-realistic young deer in soft forest light'),
  badge(6, 'raccoon-raider', 'Raccoon Raider', 'common', 'wildlife', 'Master of midnight snack missions.', 'cute semi-realistic raccoon with curious eyes near a campsite'),
  badge(7, 'firefly-field', 'Firefly Field', 'common', 'wildlife', 'Tiny lanterns dancing at dusk.', 'cute semi-realistic fireflies glowing over a summer meadow at dusk'),
  badge(8, 'pond-turtle', 'Pond Turtle', 'common', 'wildlife', 'Slow and steady to the sunny rock.', 'cute semi-realistic turtle on a sunny rock by a pond'),
  badge(9, 'canyon-bat', 'Canyon Bat', 'common', 'wildlife', 'Night navigator of red rock skies.', 'cute semi-realistic bat silhouetted against a canyon sunset sky'),
  badge(10, 'prairie-hawk', 'Prairie Hawk', 'common', 'wildlife', 'Wings wide over golden grass.', 'cute semi-realistic hawk soaring over prairie grasslands'),
  badge(11, 'stream-heron', 'Stream Heron', 'uncommon', 'wildlife', 'Patience is its superpower.', 'cute semi-realistic blue heron standing in a shallow stream'),
  badge(12, 'mountain-goat', 'Mountain Goat', 'uncommon', 'wildlife', 'Climbs where the air gets thin.', 'cute semi-realistic mountain goat on a rocky alpine ridge'),
  badge(13, 'beaver-builder', 'Beaver Builder', 'uncommon', 'wildlife', 'Nature’s best dam engineer.', 'cute semi-realistic beaver by a lodge on a forest river'),
  badge(14, 'coyote-song', 'Coyote Song', 'uncommon', 'wildlife', 'Howls that stitch the night together.', 'cute semi-realistic coyote howling under a desert moon'),
  badge(15, 'bear-cub', 'Bear Cub', 'rare', 'wildlife', 'Curious, fluffy, and full of snacks.', 'cute semi-realistic bear cub exploring a forest clearing'),
  badge(16, 'bald-eagle', 'Bald Eagle', 'rare', 'wildlife', 'King of the high sky trails.', 'cute semi-realistic bald eagle perched on a pine overlooking mountains'),
  badge(17, 'moose-morning', 'Moose Morning', 'rare', 'wildlife', 'Giant of the misty marsh.', 'cute semi-realistic moose standing in misty morning marsh'),
  badge(18, 'bighorn-ridge', 'Bighorn Ridge', 'rare', 'wildlife', 'Curved horns against blue sky.', 'cute semi-realistic bighorn sheep on a rocky desert ridge'),

  // Landscapes (12) — 019–030
  badge(19, 'pine-trail', 'Pine Trail', 'common', 'landscape', 'Needles soft under hiking boots.', 'cute semi-realistic sunlit pine forest trail winding into the woods'),
  badge(20, 'river-bend', 'River Bend', 'common', 'landscape', 'Water that always knows the way.', 'cute semi-realistic gentle river bend with smooth rocks and trees'),
  badge(21, 'prairie-sunset', 'Prairie Sunset', 'common', 'landscape', 'Gold light on endless grass.', 'cute semi-realistic prairie sunset with golden grass and warm sky'),
  badge(22, 'desert-mesa', 'Desert Mesa', 'common', 'landscape', 'Flat-topped giants in the heat.', 'cute semi-realistic desert mesa under bright blue sky'),
  badge(23, 'coastal-fog', 'Coastal Fog', 'common', 'landscape', 'Soft gray mornings by the sea.', 'cute semi-realistic foggy coastal forest meeting the ocean'),
  badge(24, 'alpine-lake', 'Alpine Lake', 'uncommon', 'landscape', 'Mirror water under snow peaks.', 'cute semi-realistic crystal alpine lake reflecting snowy mountains'),
  badge(25, 'red-rock', 'Red Rock', 'uncommon', 'landscape', 'Stone painted by ancient suns.', 'cute semi-realistic red sandstone cliffs glowing at golden hour'),
  badge(26, 'waterfall-veil', 'Waterfall Veil', 'uncommon', 'landscape', 'Cool mist on hot trail days.', 'cute semi-realistic waterfall cascading into a forest pool'),
  badge(27, 'snowy-pass', 'Snowy Pass', 'uncommon', 'landscape', 'White quiet between the peaks.', 'cute semi-realistic snowy mountain pass with soft winter light'),
  badge(28, 'deep-canyon', 'Deep Canyon', 'rare', 'landscape', 'A river wrote this story in stone.', 'cute semi-realistic deep canyon with river far below and dramatic light'),
  badge(29, 'starry-camp', 'Starry Camp', 'rare', 'landscape', 'A million lights above the tent.', 'cute semi-realistic campsite under a brilliant milky way sky'),
  badge(30, 'mountain-peak', 'Mountain Peak', 'rare', 'landscape', 'The top of the world—for today.', 'cute semi-realistic dramatic mountain peak above the clouds at sunrise'),

  // Camp life (12) — 031–042
  badge(31, 'cozy-tent', 'Cozy Tent', 'common', 'camp', 'Home is wherever you zip the door.', 'cute semi-realistic colorful camping tent in a forest clearing'),
  badge(32, 'warm-lantern', 'Warm Lantern', 'common', 'camp', 'A little sun for after dark.', 'cute semi-realistic glowing camping lantern on a wooden picnic table'),
  badge(33, 'trail-backpack', 'Trail Backpack', 'common', 'camp', 'Packed with snacks and maps.', 'cute semi-realistic hiking backpack resting on a trail rock'),
  badge(34, 'camp-compass', 'Camp Compass', 'common', 'camp', 'North is always a friend.', 'cute semi-realistic brass compass on a trail map outdoors'),
  badge(35, 'trail-marker', 'Trail Marker', 'common', 'camp', 'Blazes that say “this way.”', 'cute semi-realistic painted trail blaze marker on a forest tree'),
  badge(36, 'binocular-view', 'Binocular View', 'common', 'camp', 'Far becomes near with a click.', 'cute semi-realistic binoculars hanging from a tree branch at overlook'),
  badge(37, 'campfire-glow', 'Campfire Glow', 'uncommon', 'camp', 'Stories taste better with smoke.', 'cute semi-realistic crackling campfire with warm orange sparks at night'),
  badge(38, 'marshmallow-roast', 'Marshmallow Roast', 'uncommon', 'camp', 'Golden outside, gooey inside.', 'cute semi-realistic marshmallows roasting on sticks over a campfire'),
  badge(39, 'forest-hammock', 'Forest Hammock', 'uncommon', 'camp', 'Swing gently between two trees.', 'cute semi-realistic hammock strung between pines in dappled sunlight'),
  badge(40, 'quiet-canoe', 'Quiet Canoe', 'uncommon', 'camp', 'Paddle strokes on glass water.', 'cute semi-realistic wooden canoe on a calm forest lake at morning'),
  badge(41, 'rv-silhouette', 'RV Silhouette', 'rare', 'camp', 'Home on wheels under big sky.', 'cute semi-realistic classic RV camper silhouette at golden hour on open road'),
  badge(42, 'trail-map', 'Trail Map', 'rare', 'camp', 'X marks the next adventure.', 'cute semi-realistic unfolded trail map with compass on a picnic table'),

  // Legendary (8) — 043–050
  badge(43, 'northern-lights', 'Northern Lights', 'legendary', 'legendary', 'Green ribbons dance over the cold camp.', 'cute semi-realistic northern lights aurora over a snowy campsite, magical and wholesome'),
  badge(44, 'moon-ridge', 'Moon Ridge', 'legendary', 'legendary', 'Full moon crowns the silent ridge.', 'cute semi-realistic full moon rising over a mountain ridge, soft magical light'),
  badge(45, 'thunderhead', 'Thunderhead', 'legendary', 'legendary', 'Sky giant rolling over the desert.', 'cute semi-realistic dramatic thunderhead cloud over desert landscape, awe-inspiring'),
  badge(46, 'golden-eagle-myth', 'Golden Sky Eagle', 'legendary', 'legendary', 'Wings of sunlight on the wind.', 'cute semi-realistic majestic golden eagle soaring through sunbeams above peaks'),
  badge(47, 'ancient-sequoia', 'Ancient Sequoia', 'legendary', 'legendary', 'A tree older than stories.', 'cute semi-realistic giant sequoia tree towering in cathedral forest light'),
  badge(48, 'desert-bloom', 'Desert Bloom', 'legendary', 'legendary', 'Color that waits for rain.', 'cute semi-realistic desert in full wildflower bloom after rain, vibrant and soft'),
  badge(49, 'new-green-trail', 'New Green Trail', 'legendary', 'legendary', 'Life returns after the fire.', 'cute semi-realistic forest regrowth with bright green shoots after wildfire, hopeful'),
  badge(50, 'open-road', 'Open Road', 'legendary', 'legendary', 'The horizon never runs out.', 'cute semi-realistic endless open highway toward sunset mountains, adventure spirit'),
];

const BADGE_MAP = new Map(TRAIL_BADGES.map((b) => [b.id, b]));

export function getTrailBadge(id: string): TrailBadge | undefined {
  return BADGE_MAP.get(id);
}

export function getRarityColor(rarity: TrailBadgeRarity): string {
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

export function getRarityLabel(rarity: TrailBadgeRarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

export function getThemeLabel(theme: TrailBadgeTheme): string {
  switch (theme) {
    case 'wildlife':
      return 'Wildlife';
    case 'landscape':
      return 'Landscape';
    case 'camp':
      return 'Camp life';
    case 'legendary':
      return 'Legendary';
  }
}

/** Weighted pool: commons more often */
export function pickRandomUnownedBadges(
  ownedIds: string[],
  count: number
): TrailBadge[] {
  const unowned = TRAIL_BADGES.filter((b) => !ownedIds.includes(b.id));
  if (unowned.length === 0) return [];

  const weight = (r: TrailBadgeRarity) => {
    if (r === 'common') return 10;
    if (r === 'uncommon') return 5;
    if (r === 'rare') return 2;
    return 0.5;
  };

  const pool: TrailBadge[] = [];
  for (const b of unowned) {
    const w = Math.ceil(weight(b.rarity));
    for (let i = 0; i < w; i++) pool.push(b);
  }

  const result: TrailBadge[] = [];
  const used = new Set<string>();
  const n = Math.min(count, unowned.length);
  while (result.length < n && pool.length > 0) {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!used.has(pick.id)) {
      used.add(pick.id);
      result.push(pick);
    }
  }
  return result;
}
