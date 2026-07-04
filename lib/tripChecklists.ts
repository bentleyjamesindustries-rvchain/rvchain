export type ChecklistPackId =
  | 'backpacking'
  | 'car-camping'
  | 'rv-drivable'
  | 'vehicle-prep'
  | 'survival';

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
  sections: ChecklistSection[];
}

export const CHECKLIST_PACKS: ChecklistPack[] = [
  {
    id: 'backpacking',
    title: 'Backpacking',
    description: 'Ultralight trail camp essentials',
    icon: '🎒',
    sections: [
      {
        id: 'bp-shelter',
        title: 'Shelter & Sleep',
        items: [
          { id: 'bp-tent', label: 'Backpacking tent or tarp', required: true },
          { id: 'bp-bag', label: 'Sleeping bag (rated for forecast lows)', required: true },
          { id: 'bp-pad', label: 'Sleeping pad', required: true },
          { id: 'bp-pillow', label: 'Inflatable pillow or stuff-sack pillow' },
        ],
      },
      {
        id: 'bp-water',
        title: 'Water & Food',
        items: [
          { id: 'bp-filter', label: 'Water filter or purification tablets', required: true, tip: 'Know water sources along your route before you leave.' },
          { id: 'bp-bottles', label: 'Water bottles or hydration reservoir', required: true },
          { id: 'bp-stove', label: 'Camp stove & fuel', required: true },
          { id: 'bp-meals', label: 'Dehydrated meals + snacks', required: true },
          { id: 'bp-bear', label: 'Bear canister or hang kit (if required)', tip: 'Check land agency food-storage rules.' },
        ],
      },
      {
        id: 'bp-safety',
        title: 'Trail Safety',
        items: [
          { id: 'bp-map', label: 'Map & compass or offline GPS', required: true },
          { id: 'bp-firstaid', label: 'First aid kit', required: true },
          { id: 'bp-headlamp', label: 'Headlamp + spare batteries', required: true },
          { id: 'bp-rain', label: 'Rain shell & pack cover', required: true },
          { id: 'bp-whistle', label: 'Emergency whistle' },
        ],
      },
    ],
  },
  {
    id: 'car-camping',
    title: 'Car / Tent Camping',
    description: 'Drive-up campsite gear',
    icon: '⛺',
    sections: [
      {
        id: 'ct-shelter',
        title: 'Camp Setup',
        items: [
          { id: 'ct-tent', label: 'Family tent with stakes & guylines', required: true },
          { id: 'ct-tarp', label: 'Ground tarp or footprint' },
          { id: 'ct-chairs', label: 'Camp chairs' },
          { id: 'ct-table', label: 'Folding camp table' },
        ],
      },
      {
        id: 'ct-kitchen',
        title: 'Camp Kitchen',
        items: [
          { id: 'ct-cooler', label: 'Cooler with ice', required: true },
          { id: 'ct-stove', label: 'Two-burner camp stove', required: true },
          { id: 'ct-cookware', label: 'Pots, utensils, plates, mugs', required: true },
          { id: 'ct-lantern', label: 'Lantern or string lights' },
          { id: 'ct-trash', label: 'Trash bags & dish soap', required: true },
        ],
      },
      {
        id: 'ct-comfort',
        title: 'Comfort',
        items: [
          { id: 'ct-sleep', label: 'Sleeping bags & pads/air mattress', required: true },
          { id: 'ct-pillows', label: 'Pillows & blankets' },
          { id: 'ct-bug', label: 'Bug spray & sunscreen', required: true },
          { id: 'ct-fire', label: 'Fire starter (if fires allowed)', tip: 'Verify fire restrictions at your campground.' },
        ],
      },
    ],
  },
  {
    id: 'rv-drivable',
    title: 'RV / Drivable',
    description: 'Hookups, leveling, and site setup',
    icon: '🚐',
    sections: [
      {
        id: 'rv-hookups',
        title: 'Hookups & Connections',
        items: [
          { id: 'rv-sewer', label: 'Sewer hose & support', required: true },
          { id: 'rv-water', label: 'Drinking water hose (potable)', required: true },
          { id: 'rv-elec', label: 'Surge protector & power adapter', required: true },
          { id: 'rv-lp', label: 'Propane tank check — full & valves off while driving', required: true },
        ],
      },
      {
        id: 'rv-setup',
        title: 'Site Setup',
        items: [
          { id: 'rv-level', label: 'Leveling blocks or auto-level system', required: true },
          { id: 'rv-chocks', label: 'Wheel chocks', required: true },
          { id: 'rv-awning', label: 'Awning tiedown kit' },
          { id: 'rv-mat', label: 'Outdoor rug & step stool' },
        ],
      },
      {
        id: 'rv-inside',
        title: 'Interior Prep',
        items: [
          { id: 'rv-fridge', label: 'Fridge cooled before loading food', required: true },
          { id: 'rv-cab', label: 'Secure cabinets & loose items', required: true },
          { id: 'rv-tank', label: 'Fresh / gray / black tank levels checked', required: true },
          { id: 'rv-co', label: 'CO & smoke detectors tested', required: true },
        ],
      },
    ],
  },
  {
    id: 'vehicle-prep',
    title: 'Vehicle Prep',
    description: 'Pre-departure inspection checklist',
    icon: '🚗',
    sections: [
      {
        id: 'vp-tires',
        title: 'Tires & Wheels',
        items: [
          { id: 'vp-pressure', label: 'Tire pressure (including spare)', required: true },
          { id: 'vp-tread', label: 'Tread depth & sidewall inspection', required: true },
          { id: 'vp-torque', label: 'Lug nuts torqued (after recent service)' },
        ],
      },
      {
        id: 'vp-fluids',
        title: 'Fluids & Mechanical',
        items: [
          { id: 'vp-oil', label: 'Engine oil level', required: true },
          { id: 'vp-coolant', label: 'Coolant & washer fluid', required: true },
          { id: 'vp-brakes', label: 'Brake feel & trailer brake test (if towing)', required: true },
          { id: 'vp-battery', label: 'Battery terminals clean & charged', required: true },
        ],
      },
      {
        id: 'vp-emergency',
        title: 'Emergency Kit',
        items: [
          { id: 'vp-jumper', label: 'Jumper cables or jump pack', required: true },
          { id: 'vp-triangle', label: 'Reflective triangles or flares' },
          { id: 'vp-toolkit', label: 'Basic toolkit & duct tape' },
          { id: 'vp-tow', label: 'Tow strap / roadside assistance plan', tip: 'Save your provider number offline.' },
        ],
      },
    ],
  },
  {
    id: 'survival',
    title: 'Survival & Boondocking',
    description: 'Off-grid readiness and safety tips',
    icon: '🧭',
    sections: [
      {
        id: 'sv-water-power',
        title: 'Water & Power',
        items: [
          { id: 'sv-water', label: 'Extra water storage (1 gal/person/day min.)', required: true, tip: 'Boondocking: plan 2+ gallons per person in hot climates.' },
          { id: 'sv-solar', label: 'Solar panel or generator plan' },
          { id: 'sv-inverter', label: 'Inverter & charged backup battery' },
        ],
      },
      {
        id: 'sv-comms',
        title: 'Comms & Navigation',
        items: [
          { id: 'sv-offline', label: 'Offline maps downloaded', required: true },
          { id: 'sv-sat', label: 'Satellite messenger or PLB (remote areas)', tip: 'Cell service is not guaranteed on public lands.' },
          { id: 'sv-weather', label: 'Weather radio or app alerts', required: true },
        ],
      },
      {
        id: 'sv-safety',
        title: 'Safety & First Aid',
        items: [
          { id: 'sv-fa', label: 'Expanded first aid kit', required: true },
          { id: 'sv-fire', label: 'Fire extinguisher accessible', required: true },
          { id: 'sv-shelter', label: 'Emergency shelter / space blanket' },
          { id: 'sv-signal', label: 'Signal mirror & whistle' },
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