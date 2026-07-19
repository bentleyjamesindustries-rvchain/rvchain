import { spotImageByIndex } from './spotImages';

export interface Park {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  rating: number;
  price: number | null;
  amenities: string[];
  description: string | null;
  image: string | null;
  submitted_by?: string | null;
  verified?: boolean;
  verified_at?: string | null;
  verified_by?: string | null;
  created_at?: string;
  /** Demo / sample listing source label */
  source?: string;
  sourceUrl?: string;
}

/**
 * Fictional demo spots only. Names, businesses, and copy are invented for UI
 * preview. Not real parks, not affiliated with any brand or agency.
 */
export const parks: Park[] = [
  {
    id: 'p1',
    name: 'Pinehollow Loop Camp',
    city: 'Cedar Bend',
    state: 'MT',
    lat: 44.659,
    lng: -111.099,
    rating: 4.6,
    price: 55,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', '50 Amp'],
    description:
      'Demo sample: spacious pads among pines. Fictional spot for UI only — not a real park.',
    image: spotImageByIndex(0),
  },
  {
    id: 'p2',
    name: 'Red Mesa Rest',
    city: 'Sand Hollow',
    state: 'UT',
    lat: 37.188,
    lng: -113.004,
    rating: 4.8,
    price: 68,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'],
    description:
      'Demo sample: red-rock views and pull-throughs. Fictional listing — not a real resort.',
    image: spotImageByIndex(1),
  },
  {
    id: 'p3',
    name: 'Rimrock Trailer Grove',
    city: 'Canyon Gate',
    state: 'AZ',
    lat: 35.973,
    lng: -112.142,
    rating: 4.3,
    price: 42,
    amenities: ['Full Hookups', 'Dump Station', 'Pet Friendly', 'Store'],
    description:
      'Demo sample: quiet nights near rim country. Fictional spot for map/catalog preview.',
    image: spotImageByIndex(2),
  },
  {
    id: 'p4',
    name: 'Bluewater Pad Park',
    city: 'Shoreline',
    state: 'AZ',
    lat: 36.912,
    lng: -111.455,
    rating: 4.5,
    price: 49,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', 'Propane'],
    description:
      'Demo sample: lakeside feel and open sky. Fictional data only.',
    image: spotImageByIndex(3),
  },
  {
    id: 'p5',
    name: 'Sierra Gate RV Rest',
    city: 'Oakridge',
    state: 'CA',
    lat: 37.328,
    lng: -119.649,
    rating: 4.7,
    price: 72,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'],
    description:
      'Demo sample: large pull-throughs and dark skies. Not a real business.',
    image: spotImageByIndex(4),
  },
  {
    id: 'p6',
    name: 'Harbor Mist Camp',
    city: 'Seacliff',
    state: 'CA',
    lat: 35.366,
    lng: -120.849,
    rating: 4.4,
    price: 58,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', 'Dump Station'],
    description:
      'Demo sample: coastal breeze and easy access. Fictional spot only.',
    image: spotImageByIndex(5),
  },
  {
    id: 'p7',
    name: 'Tallwood Grove Camp',
    city: 'Fogline',
    state: 'CA',
    lat: 41.753,
    lng: -124.195,
    rating: 4.9,
    price: 65,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry'],
    description:
      'Demo sample: among giant trees. Fictional listing for demo UI.',
    image: spotImageByIndex(6),
  },
  {
    id: 'p8',
    name: 'Gorge Wind Rest',
    city: 'Riverbend',
    state: 'OR',
    lat: 45.705,
    lng: -121.521,
    rating: 4.6,
    price: 52,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', '50 Amp'],
    description:
      'Demo sample: canyon views and open pads. Not a real park.',
    image: spotImageByIndex(0),
  },
  {
    id: 'p9',
    name: 'Summit Meadow Pads',
    city: 'Highpass',
    state: 'WA',
    lat: 46.756,
    lng: -121.998,
    rating: 4.5,
    price: 60,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Store'],
    description:
      'Demo sample: mountain meadow setting. Fictional data only.',
    image: spotImageByIndex(1),
  },
  {
    id: 'p10',
    name: 'Elktrail RV Rest',
    city: 'Pineview',
    state: 'CO',
    lat: 40.376,
    lng: -105.511,
    rating: 4.7,
    price: 75,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', '50 Amp'],
    description:
      'Demo sample: alpine foothills and quiet loops. Not a real resort.',
    image: spotImageByIndex(2),
  },
  {
    id: 'p11',
    name: 'Prairie Butte Camp',
    city: 'Dustline',
    state: 'SD',
    lat: 43.992,
    lng: -102.244,
    rating: 4.2,
    price: 38,
    amenities: ['Full Hookups', 'Dump Station', 'Pet Friendly', 'Store'],
    description:
      'Demo sample: wide skies and open grassland. Fictional spot only.',
    image: spotImageByIndex(3),
  },
  {
    id: 'p12',
    name: 'Hillfork Family Camp',
    city: 'Clearwater',
    state: 'TX',
    lat: 30.047,
    lng: -99.145,
    rating: 4.8,
    price: 48,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'],
    description:
      'Demo sample: rolling hills and shady sites. Fictional listing.',
    image: spotImageByIndex(4),
  },
  {
    id: 'p13',
    name: 'Saltbreeze Pads',
    city: 'Bayfront',
    state: 'TX',
    lat: 29.287,
    lng: -94.797,
    rating: 4.3,
    price: 45,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', 'Pool'],
    description:
      'Demo sample: near the gulf shore. Not a real business.',
    image: spotImageByIndex(5),
  },
  {
    id: 'p14',
    name: 'Starfall Desert Camp',
    city: 'Terrawell',
    state: 'TX',
    lat: 29.316,
    lng: -103.615,
    rating: 4.6,
    price: 52,
    amenities: ['Full Hookups', 'Pet Friendly', 'Dump Station', 'Propane'],
    description:
      'Demo sample: dark-sky desert solitude. Fictional data for demo only.',
    image: spotImageByIndex(6),
  },
  {
    id: 'p15',
    name: 'Mangrove Loop Camp',
    city: 'Sawgrass',
    state: 'FL',
    lat: 25.462,
    lng: -80.477,
    rating: 4.4,
    price: 55,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'],
    description:
      'Demo sample: subtropical birding country. Not a real park.',
    image: spotImageByIndex(0),
  },
  {
    id: 'p16',
    name: 'Keyline Harbor Rest',
    city: 'Coral Point',
    state: 'FL',
    lat: 24.554,
    lng: -81.755,
    rating: 4.1,
    price: 82,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'],
    description:
      'Demo sample: southernmost fictional resort vibe. Sample UI data only.',
    image: spotImageByIndex(1),
  },
  {
    id: 'p17',
    name: 'Ridgepath Family Camp',
    city: 'Millcreek',
    state: 'NC',
    lat: 35.486,
    lng: -83.315,
    rating: 4.7,
    price: 47,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry'],
    description:
      'Demo sample: forest ridges and cool mornings. Fictional spot.',
    image: spotImageByIndex(2),
  },
  {
    id: 'p18',
    name: 'Smoky Creek Pads',
    city: 'Hearthwood',
    state: 'TN',
    lat: 35.787,
    lng: -83.554,
    rating: 4.5,
    price: 58,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'],
    description:
      'Demo sample: family-friendly mountain loops. Not affiliated with any real venue.',
    image: spotImageByIndex(3),
  },
  {
    id: 'p19',
    name: 'Mirrorlake Camp',
    city: 'Northshore',
    state: 'NY',
    lat: 43.421,
    lng: -73.712,
    rating: 4.3,
    price: 52,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry'],
    description:
      'Demo sample: lake-country setting. Fictional listing only.',
    image: spotImageByIndex(4),
  },
  {
    id: 'p20',
    name: 'Tidepine Rest',
    city: 'Harborwick',
    state: 'ME',
    lat: 44.388,
    lng: -68.203,
    rating: 4.8,
    price: 69,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry', '50 Amp'],
    description:
      'Demo sample: rocky coast and pines. Not a real park.',
    image: spotImageByIndex(5),
  },
  {
    id: 'p21',
    name: 'Duneview Camp',
    city: 'Lakeshore',
    state: 'MI',
    lat: 44.895,
    lng: -85.986,
    rating: 4.6,
    price: 48,
    amenities: ['Full Hookups', 'Pet Friendly', 'Dump Station', 'Store'],
    description:
      'Demo sample: dunes and blue water. Fictional demo data.',
    image: spotImageByIndex(6),
  },
  {
    id: 'p22',
    name: 'Canoe Bend Campground',
    city: 'Northwood',
    state: 'MN',
    lat: 47.902,
    lng: -91.867,
    rating: 4.4,
    price: 39,
    amenities: ['Full Hookups', 'Pet Friendly', 'Dump Station', 'Propane'],
    description:
      'Demo sample: quiet north-woods base. Not a real business.',
    image: spotImageByIndex(0),
  },
  {
    id: 'p23',
    name: 'Riverstone Pads',
    city: 'Flatrock',
    state: 'MT',
    lat: 45.661,
    lng: -110.564,
    rating: 4.5,
    price: 44,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Laundry'],
    description:
      'Demo sample: riverside fishing vibe. Fictional spot for UI only.',
    image: spotImageByIndex(1),
  },
  {
    id: 'p24',
    name: 'Coppercliff Rest',
    city: 'Redstone',
    state: 'AZ',
    lat: 34.863,
    lng: -111.812,
    rating: 4.9,
    price: 78,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'],
    description:
      'Demo sample: copper-colored cliffs at dusk. Fictional listing.',
    image: spotImageByIndex(2),
  },
  {
    id: 'p25',
    name: 'Outer Dune Pads',
    city: 'Seagrass',
    state: 'NC',
    lat: 35.943,
    lng: -75.624,
    rating: 4.2,
    price: 61,
    amenities: ['Full Hookups', 'WiFi', 'Pet Friendly', 'Pool', 'Laundry'],
    description:
      'Demo sample: beach-access vibe. Not a real resort or brand.',
    image: spotImageByIndex(3),
  },
];

// Haversine distance calculation (miles)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
