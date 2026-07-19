export type ChecklistPackId =
  | 'backpacking'
  | 'car-camping'
  | 'rv-drivable'
  | 'vehicle-prep'
  | 'survival'
  | 'family-road';

export interface ChecklistItem {
  id: string;
  label: string;
  tip?: string;
  required?: boolean;
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistPack {
  id: ChecklistPackId;
  title: string;
  description: string;
  icon: string;
  durationHint?: string;
  audience?: string;
  sections: ChecklistSection[];
}

export const CHECKLIST_PACKS: ChecklistPack[] = [
  {
    id: 'backpacking',
    title: 'Trail backpacking',
    description: 'Ultralight overnight and multi-day trail camp essentials',
    icon: '🎒',
    durationHint: 'Overnight+',
    audience: 'Hikers & trail campers',
    sections: [
      {
        id: 'bp-shelter',
        title: 'Shelter & sleep',
        items: [
          { id: 'bp-tent', label: 'Backpacking tent or tarp', required: true },
          { id: 'bp-stakes', label: 'Stakes + guylines', required: true },
          { id: 'bp-bag', label: 'Sleeping bag rated for forecast lows', required: true },
          { id: 'bp-pad', label: 'Sleeping pad', required: true },
          { id: 'bp-pillow', label: 'Inflatable or stuff-sack pillow' },
          { id: 'bp-liner', label: 'Sleep liner (optional warmth)' },
        ],
      },
      {
        id: 'bp-water',
        title: 'Water & food',
        items: [
          { id: 'bp-filter', label: 'Water filter or purification', required: true, tip: 'Know water sources along your route.' },
          { id: 'bp-bottles', label: 'Bottles or hydration reservoir', required: true },
          { id: 'bp-stove', label: 'Camp stove & fuel', required: true },
          { id: 'bp-cook', label: 'Pot, spoon, mug', required: true },
          { id: 'bp-meals', label: 'Meals + high-calorie snacks', required: true },
          { id: 'bp-bear', label: 'Bear can or hang kit if required', tip: 'Check land agency food rules.' },
          { id: 'bp-trash', label: 'Pack-out bags', required: true },
        ],
      },
      {
        id: 'bp-clothing',
        title: 'Clothing layers',
        items: [
          { id: 'bp-base', label: 'Base layers (no cotton)', required: true },
          { id: 'bp-insul', label: 'Insulating mid-layer' },
          { id: 'bp-shell', label: 'Rain shell + pack cover', required: true },
          { id: 'bp-socks', label: 'Extra socks', required: true },
          { id: 'bp-hat', label: 'Sun hat + warm beanie' },
          { id: 'bp-gloves', label: 'Light gloves (seasonal)' },
        ],
      },
      {
        id: 'bp-safety',
        title: 'Navigation & safety',
        items: [
          { id: 'bp-map', label: 'Map + compass or offline GPS', required: true },
          { id: 'bp-firstaid', label: 'First aid kit', required: true },
          { id: 'bp-headlamp', label: 'Headlamp + spare batteries', required: true },
          { id: 'bp-whistle', label: 'Emergency whistle', required: true },
          { id: 'bp-knife', label: 'Small knife or multi-tool' },
          { id: 'bp-fire', label: 'Fire starter (where legal)' },
          { id: 'bp-permit', label: 'Permits / parking pass printed or offline' },
        ],
      },
      {
        id: 'bp-lnt',
        title: 'Leave no trace',
        items: [
          { id: 'bp-tp', label: 'Toilet paper + trowel (if needed)', required: true },
          { id: 'bp-soap', label: 'Biodegradable soap (use away from water)' },
          { id: 'bp-plan', label: 'Share itinerary with someone', required: true },
        ],
      },
    ],
  },
  {
    id: 'car-camping',
    title: 'Car / tent camp',
    description: 'Drive-up campsite gear for weekends and family camps',
    icon: '⛺',
    durationHint: 'Weekend',
    audience: 'Car campers',
    sections: [
      {
        id: 'ct-setup',
        title: 'Camp setup',
        items: [
          { id: 'ct-tent', label: 'Tent, stakes, guylines', required: true },
          { id: 'ct-tarp', label: 'Footprint / ground tarp' },
          { id: 'ct-chairs', label: 'Camp chairs', required: true },
          { id: 'ct-table', label: 'Folding table' },
          { id: 'ct-shade', label: 'Canopy or tarp for shade' },
          { id: 'ct-lights', label: 'Lantern / string lights', required: true },
          { id: 'ct-mallet', label: 'Mallet or hammer for stakes' },
        ],
      },
      {
        id: 'ct-kitchen',
        title: 'Camp kitchen',
        items: [
          { id: 'ct-cooler', label: 'Cooler + ice plan', required: true },
          { id: 'ct-stove', label: 'Camp stove + fuel', required: true },
          { id: 'ct-cookware', label: 'Pots, pans, utensils, plates, mugs', required: true },
          { id: 'ct-cutting', label: 'Cutting board + knife' },
          { id: 'ct-bin', label: 'Wash bin, sponge, dish soap', required: true },
          { id: 'ct-trash', label: 'Trash & recycle bags', required: true },
          { id: 'ct-water', label: 'Drinking water jugs', required: true },
          { id: 'ct-coffee', label: 'Coffee/tea setup' },
        ],
      },
      {
        id: 'ct-sleep',
        title: 'Sleep & comfort',
        items: [
          { id: 'ct-sleep', label: 'Sleeping bags or blankets', required: true },
          { id: 'ct-pad', label: 'Pads or air mattress', required: true },
          { id: 'ct-pillow', label: 'Pillows' },
          { id: 'ct-clothes', label: 'Weather-appropriate clothes + rain layer', required: true },
          { id: 'ct-bug', label: 'Bug spray & sunscreen', required: true },
          { id: 'ct-fire', label: 'Fire starter (if fires allowed)', tip: 'Check fire restrictions.' },
        ],
      },
      {
        id: 'ct-family',
        title: 'Family & pets',
        items: [
          { id: 'ct-kids', label: 'Kids’ clothes, comfort items, games' },
          { id: 'ct-pet', label: 'Pet food, leash, waste bags' },
          { id: 'ct-first', label: 'First aid kit', required: true },
          { id: 'ct-chargers', label: 'Phone chargers / power bank', required: true },
        ],
      },
      {
        id: 'ct-docs',
        title: 'Docs & departure',
        items: [
          { id: 'ct-res', label: 'Reservation confirmation (offline)', required: true },
          { id: 'ct-cash', label: 'Cash/card for ice & dump fees' },
          { id: 'ct-home', label: 'House locked, mail/pets plan', required: true },
        ],
      },
    ],
  },
  {
    id: 'rv-drivable',
    title: 'RV arrival & setup',
    description: 'Hookups, leveling, and live-aboard site routine',
    icon: '🚐',
    durationHint: 'Every stop',
    audience: 'RV owners',
    sections: [
      {
        id: 'rv-hookups',
        title: 'Hookups & connections',
        items: [
          { id: 'rv-sewer', label: 'Sewer hose, support, gloves', required: true },
          { id: 'rv-water', label: 'Potable water hose + pressure regulator', required: true },
          { id: 'rv-filter', label: 'Water filter (if you use one)' },
          { id: 'rv-elec', label: 'Surge protector / EMS + adapter', required: true },
          { id: 'rv-lp', label: 'Propane checked — full enough for stay', required: true },
          { id: 'rv-cable', label: 'Cable/TV hookup (optional)' },
        ],
      },
      {
        id: 'rv-setup',
        title: 'Site setup',
        items: [
          { id: 'rv-spot', label: 'Confirm site # and pull-through vs back-in', required: true },
          { id: 'rv-level', label: 'Level rig (blocks or auto-level)', required: true },
          { id: 'rv-chocks', label: 'Wheel chocks', required: true },
          { id: 'rv-slides', label: 'Clear slides before extending', required: true },
          { id: 'rv-awning', label: 'Awning + tie-downs if windy' },
          { id: 'rv-mat', label: 'Outdoor mat / step stool' },
          { id: 'rv-stabil', label: 'Stabilizer jacks down (if equipped)', required: true },
        ],
      },
      {
        id: 'rv-inside',
        title: 'Interior prep',
        items: [
          { id: 'rv-fridge', label: 'Fridge cold before loading food', required: true },
          { id: 'rv-cab', label: 'Cabinets secured for travel', required: true },
          { id: 'rv-tank', label: 'Fresh / gray / black levels known', required: true },
          { id: 'rv-co', label: 'CO & smoke detectors tested', required: true },
          { id: 'rv-ext', label: 'Fire extinguisher accessible', required: true },
          { id: 'rv-wifi', label: 'Camp Wi‑Fi / hotspot plan' },
        ],
      },
      {
        id: 'rv-depart',
        title: 'Departure day',
        items: [
          { id: 'rv-dump', label: 'Dump tanks if needed', required: true },
          { id: 'rv-unhook', label: 'Unhook power, water, sewer', required: true },
          { id: 'rv-slidesin', label: 'Slides in, awning secured', required: true },
          { id: 'rv-walk', label: 'Walk-around: nothing left outside', required: true },
          { id: 'rv-trash', label: 'Trash dumped / site clean', required: true },
        ],
      },
      {
        id: 'rv-comfort',
        title: 'Comfort & pets',
        items: [
          { id: 'rv-linens', label: 'Bedding / towels' },
          { id: 'rv-kitchen', label: 'Cookware & pantry basics', required: true },
          { id: 'rv-pet', label: 'Pet gear, waste bags, shade plan' },
          { id: 'rv-meds', label: 'Meds & first aid', required: true },
        ],
      },
    ],
  },
  {
    id: 'vehicle-prep',
    title: 'Tow / drive prep',
    description: 'Pre-departure inspection for towables and motorhomes',
    icon: '🚗',
    durationHint: 'Before rolling',
    audience: 'Drivers & towers',
    sections: [
      {
        id: 'vp-tires',
        title: 'Tires & wheels',
        items: [
          { id: 'vp-pressure', label: 'Tire pressures (incl. spare) cold', required: true },
          { id: 'vp-tread', label: 'Tread & sidewall check', required: true },
          { id: 'vp-torque', label: 'Lug nuts if recently serviced' },
          { id: 'vp-bearings', label: 'Trailer bearings service interval OK' },
        ],
      },
      {
        id: 'vp-hitch',
        title: 'Hitch & tow (if applicable)',
        items: [
          { id: 'vp-ball', label: 'Correct ball size / hitch class', required: true },
          { id: 'vp-coupler', label: 'Coupler locked & safety pin', required: true },
          { id: 'vp-chains', label: 'Safety chains crossed', required: true },
          { id: 'vp-breakaway', label: 'Breakaway cable attached', required: true },
          { id: 'vp-wd', label: 'Weight distribution / sway set (if used)' },
          { id: 'vp-lights', label: 'Running, brake, turn lights work', required: true },
        ],
      },
      {
        id: 'vp-fluids',
        title: 'Fluids & mechanical',
        items: [
          { id: 'vp-oil', label: 'Engine oil', required: true },
          { id: 'vp-coolant', label: 'Coolant & washer fluid', required: true },
          { id: 'vp-brakes', label: 'Brake feel / trailer brake controller', required: true },
          { id: 'vp-battery', label: 'Chassis battery healthy', required: true },
          { id: 'vp-wipers', label: 'Wipers & washer spray' },
        ],
      },
      {
        id: 'vp-load',
        title: 'Weight & load',
        items: [
          { id: 'vp-payload', label: 'Within GVWR / tongue weight guidance', required: true, tip: 'Weigh when you can; don’t guess.' },
          { id: 'vp-secure', label: 'Cargo secured inside vehicle/RV', required: true },
          { id: 'vp-mirrors', label: 'Tow mirrors adjusted', required: true },
        ],
      },
      {
        id: 'vp-docs',
        title: 'Documents & emergency',
        items: [
          { id: 'vp-license', label: 'License, registration, insurance', required: true },
          { id: 'vp-roadside', label: 'Roadside assistance number offline', required: true },
          { id: 'vp-jumper', label: 'Jump pack or cables', required: true },
          { id: 'vp-triangles', label: 'Reflective triangles' },
          { id: 'vp-toolkit', label: 'Basic tools, tape, zip ties' },
          { id: 'vp-fire', label: 'Fire extinguisher charged', required: true },
        ],
      },
    ],
  },
  {
    id: 'survival',
    title: 'Boondocking / off-grid',
    description: 'Water, power, waste, and safety away from hookups',
    icon: '🧭',
    durationHint: 'Dry camping',
    audience: 'Off-grid stays',
    sections: [
      {
        id: 'sv-water',
        title: 'Water plan',
        items: [
          { id: 'sv-water', label: 'Water budget (1+ gal/person/day)', required: true, tip: 'Hot weather: plan more.' },
          { id: 'sv-jugs', label: 'Extra jugs or bladder', required: true },
          { id: 'sv-conserve', label: 'Navy showers / dish plan', required: true },
          { id: 'sv-filter', label: 'Filter for natural sources if used' },
        ],
      },
      {
        id: 'sv-power',
        title: 'Power plan',
        items: [
          { id: 'sv-solar', label: 'Solar and/or generator plan', required: true },
          { id: 'sv-fuel', label: 'Generator fuel + safe storage' },
          { id: 'sv-battery', label: 'House batteries charged', required: true },
          { id: 'sv-loads', label: 'Know big loads (AC, microwave)', required: true },
        ],
      },
      {
        id: 'sv-waste',
        title: 'Waste & site',
        items: [
          { id: 'sv-black', label: 'Black tank strategy / dump plan', required: true },
          { id: 'sv-trash', label: 'Pack out trash', required: true },
          { id: 'sv-level', label: 'Level ground / pads', required: true },
          { id: 'sv-rules', label: 'Land rules & stay limits checked', required: true },
        ],
      },
      {
        id: 'sv-comms',
        title: 'Comms & weather',
        items: [
          { id: 'sv-offline', label: 'Offline maps downloaded', required: true },
          { id: 'sv-weather', label: 'Weather forecast & alerts', required: true },
          { id: 'sv-sat', label: 'Satellite messenger in remote areas', tip: 'Cell is not guaranteed.' },
          { id: 'sv-share', label: 'Itinerary shared with contact', required: true },
        ],
      },
      {
        id: 'sv-safety',
        title: 'Safety',
        items: [
          { id: 'sv-fa', label: 'Expanded first aid', required: true },
          { id: 'sv-fire', label: 'Fire extinguisher + local fire rules', required: true },
          { id: 'sv-wildlife', label: 'Food storage / wildlife plan', required: true },
          { id: 'sv-shade', label: 'Shade & heat plan' },
          { id: 'sv-light', label: 'Headlamps for night moves', required: true },
        ],
      },
    ],
  },
  {
    id: 'family-road',
    title: 'Family road trip',
    description: 'Kids, snacks, documents, and sanity on long drives',
    icon: '👨‍👩‍👧‍👦',
    durationHint: 'Road days',
    audience: 'Families',
    sections: [
      {
        id: 'fr-docs',
        title: 'Documents',
        items: [
          { id: 'fr-ids', label: 'IDs for adults', required: true },
          { id: 'fr-ins', label: 'Insurance cards', required: true },
          { id: 'fr-res', label: 'Lodging/camp reservations offline', required: true },
          { id: 'fr-medical', label: 'Medical cards / allergy list', required: true },
        ],
      },
      {
        id: 'fr-car',
        title: 'Vehicle comfort',
        items: [
          { id: 'fr-seats', label: 'Car seats installed correctly', required: true },
          { id: 'fr-chargers', label: 'Chargers & cables', required: true },
          { id: 'fr-tissues', label: 'Wipes, tissues, trash bags', required: true },
          { id: 'fr-blanket', label: 'Blanket & change of clothes' },
        ],
      },
      {
        id: 'fr-food',
        title: 'Snacks & meals',
        items: [
          { id: 'fr-snacks', label: 'Snacks & water for each person', required: true },
          { id: 'fr-cooler', label: 'Cooler for day food' },
          { id: 'fr-utensils', label: 'Reusable utensils / napkins' },
          { id: 'fr-stop', label: 'Meal stop plan (no hangry surprises)', required: true },
        ],
      },
      {
        id: 'fr-kids',
        title: 'Kids & entertainment',
        items: [
          { id: 'fr-games', label: 'Books, games, tablets + headphones' },
          { id: 'fr-comfort', label: 'Comfort items / stuffed animal' },
          { id: 'fr-activity', label: 'Printed activity or sticker pack' },
          { id: 'fr-schedule', label: 'Break every 2 hours when possible', required: true },
        ],
      },
      {
        id: 'fr-safety',
        title: 'Health & safety',
        items: [
          { id: 'fr-first', label: 'First aid + kids’ meds', required: true },
          { id: 'fr-sun', label: 'Sunscreen & hats', required: true },
          { id: 'fr-emergency', label: 'Emergency contact list offline', required: true },
          { id: 'fr-meetup', label: 'Family meetup plan if separated' },
        ],
      },
    ],
  },
];

const PACK_MAP = new Map(CHECKLIST_PACKS.map((p) => [p.id, p]));

export function getChecklistPack(id: ChecklistPackId): ChecklistPack | undefined {
  return PACK_MAP.get(id);
}

export function getAllPackIds(): ChecklistPackId[] {
  return CHECKLIST_PACKS.map((p) => p.id);
}

export function countPackItems(pack: ChecklistPack): number {
  return pack.sections.reduce((n, s) => n + s.items.length, 0);
}

export function countPackEssentials(pack: ChecklistPack): number {
  return pack.sections.reduce(
    (n, s) => n + s.items.filter((i) => i.required).length,
    0
  );
}

export function getPackPreviewMeta(pack: ChecklistPack): {
  itemCount: number;
  essentialCount: number;
  sectionCount: number;
} {
  return {
    itemCount: countPackItems(pack),
    essentialCount: countPackEssentials(pack),
    sectionCount: pack.sections.length,
  };
}

/** Total checked across selected packs for a trip */
export function countTripChecklistTotals(
  packIds: ChecklistPackId[],
  getChecked: (packId: ChecklistPackId) => string[]
): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const id of packIds) {
    const pack = getChecklistPack(id);
    if (!pack) continue;
    total += countPackItems(pack);
    done += getChecked(id).length;
  }
  return { done, total };
}
