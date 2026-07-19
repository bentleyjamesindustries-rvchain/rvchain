import type { Park } from './parks';

/**
 * Fictional demo “public-style” spots for catalog variety.
 * Not real agency sites, not affiliated with any government park system.
 */
export const PUBLIC_CAMPGROUND_SOURCES = ['demo-sample'] as const;

export type PublicCampgroundSource = (typeof PUBLIC_CAMPGROUND_SOURCES)[number];

export interface PublicCampground extends Park {
  source: PublicCampgroundSource;
  sourceUrl: string;
}

function pub(
  id: string,
  name: string,
  city: string,
  state: string,
  lat: number,
  lng: number,
  description: string,
  amenities: string[] = ['Camping', 'Restrooms'],
  price: number | null = null
): PublicCampground {
  return {
    id,
    name,
    city,
    state,
    lat,
    lng,
    rating: 4.2,
    price,
    amenities,
    description,
    image: null,
    verified: true,
    verified_by: 'demo sample',
    source: 'demo-sample',
    sourceUrl: '',
  };
}

/** Invented sample campgrounds for demo maps — not real places or brands. */
export const publicCampgrounds: PublicCampground[] = [
  pub(
    'pub-demo-1',
    'Sandrim Loop Camp',
    'Rimtown',
    'AZ',
    36.054,
    -112.139,
    'Demo sample developed loop. Fictional — not a real public campground.',
    ['Camping', 'Restrooms', 'Dump Station'],
    18
  ),
  pub(
    'pub-demo-2',
    'East Mesa Pads',
    'Cliffside',
    'AZ',
    36.046,
    -111.823,
    'Demo sample rim-road style camp. Fictional data only.'
  ),
  pub(
    'pub-demo-3',
    'Canyon Gate Camp',
    'Redvale',
    'UT',
    37.201,
    -112.989,
    'Demo sample entrance-area pads. Not a real park.',
    ['Camping', 'Electric', 'Restrooms'],
    20
  ),
  pub(
    'pub-demo-4',
    'Valley Pines Camp',
    'Mercedale',
    'CA',
    37.739,
    -119.558,
    'Demo sample valley floor camp. Fictional listing.',
    ['Camping', 'Restrooms', 'Food Storage'],
    26
  ),
  pub(
    'pub-demo-5',
    'Jumbo Stone Camp',
    'Palmside',
    'CA',
    34.013,
    -116.067,
    'Demo sample desert rock camp. Not a real business.',
    ['Camping', 'Restrooms'],
    20
  ),
  pub(
    'pub-demo-6',
    'Heatwell Camp',
    'Basinview',
    'CA',
    36.463,
    -116.868,
    'Demo sample low-desert developed camp. Fictional only.',
    ['Camping', 'Restrooms', 'Dump Station'],
    22
  ),
  pub(
    'pub-demo-7',
    'Glacier Creek Camp',
    'Alpine Gate',
    'CO',
    40.318,
    -105.545,
    'Demo sample mountain camp. Not affiliated with any agency.',
    ['Camping', 'Restrooms'],
    30
  ),
  pub(
    'pub-demo-8',
    'Dune Flats Camp',
    'Sandrise',
    'CO',
    37.734,
    -105.512,
    'Demo sample sand-country camp. Fictional data.'
  ),
  pub(
    'pub-demo-9',
    'Longpine Key Camp',
    'Marshpoint',
    'FL',
    25.429,
    -80.676,
    'Demo sample subtropical camp. Not a real park.',
    ['Camping', 'Restrooms'],
    30
  ),
  pub(
    'pub-demo-10',
    'Blackpine Coast Camp',
    'Tidehaven',
    'ME',
    44.338,
    -68.207,
    'Demo sample coastal forest camp. Fictional listing.',
    ['Camping', 'Restrooms'],
    30
  ),
  pub(
    'pub-demo-11',
    'Madison Fork Camp',
    'Westgate',
    'MT',
    44.645,
    -110.858,
    'Demo sample mountain-west camp. Sample UI data only.',
    ['Camping', 'Restrooms'],
    32
  ),
  pub(
    'pub-demo-12',
    'Bridge Bay Demo Camp',
    'Lakeline',
    'WY',
    44.535,
    -110.421,
    'Demo sample lakeside camp. Not a real facility.'
  ),
  pub(
    'pub-demo-13',
    'Smoke Creek Camp',
    'Ridgevale',
    'NC',
    35.556,
    -83.311,
    'Demo sample forest camp. Fictional only.',
    ['Camping', 'Restrooms'],
    25
  ),
  pub(
    'pub-demo-14',
    'Cove Meadow Camp',
    'Townsend Gap',
    'TN',
    35.595,
    -83.812,
    'Demo sample valley camp. Not a real business.'
  ),
  pub(
    'pub-demo-15',
    'Mazama Loop Camp',
    'Crater View',
    'OR',
    42.868,
    -122.168,
    'Demo sample high-country camp. Fictional data.'
  ),
  pub(
    'pub-demo-16',
    'Rainforest Bend Camp',
    'Forkline',
    'WA',
    47.859,
    -123.934,
    'Demo sample rainforest camp. Not a real park.'
  ),
  pub(
    'pub-demo-17',
    'Sage Flat Camp',
    'Interior Gap',
    'SD',
    43.736,
    -102.365,
    'Demo sample prairie camp. Fictional listing.',
    ['Camping'],
    0
  ),
  pub(
    'pub-demo-18',
    'Basin Rim Camp',
    'Desert Bend',
    'TX',
    29.253,
    -103.244,
    'Demo sample desert basin camp. Not a real facility.',
    ['Camping', 'Restrooms'],
    16
  ),
  pub(
    'pub-demo-19',
    'Arch Trail Camp',
    'Redrock Vale',
    'UT',
    38.782,
    -109.592,
    'Demo sample red-rock camp. Fictional only.'
  ),
  pub(
    'pub-demo-20',
    'Meadow Arm Camp',
    'Skyline Ridge',
    'VA',
    38.612,
    -78.332,
    'Demo sample ridge camp. Not a real park.'
  ),
  pub(
    'pub-demo-21',
    'River Bend State-Style Camp',
    'Springfork',
    'TX',
    29.874,
    -98.478,
    'Demo sample riverside camp. Fictional — not a state park.',
    ['Camping', 'Restrooms', 'Water'],
    15
  ),
  pub(
    'pub-demo-22',
    'Canyon Rim State-Style Camp',
    'Bluffview',
    'TX',
    34.986,
    -101.682,
    'Demo sample canyon camp. Not a real agency site.'
  ),
  pub(
    'pub-demo-23',
    'Redwood Fork Camp',
    'Coastal Grove',
    'CA',
    36.247,
    -121.782,
    'Demo sample redwood canyon camp. Fictional data only.'
  ),
  pub(
    'pub-demo-24',
    'Palm Canyon Demo Camp',
    'Desert Spring',
    'CA',
    33.27,
    -116.407,
    'Demo sample desert oasis camp. Not a real business.'
  ),
  pub(
    'pub-demo-25',
    'Prairie River Camp',
    'Wetland Edge',
    'FL',
    27.242,
    -82.304,
    'Demo sample prairie-and-river camp. Fictional listing.'
  ),
  pub(
    'pub-demo-26',
    'Cloud Rim Camp',
    'Rising Crest',
    'GA',
    34.834,
    -85.473,
    'Demo sample canyon-rim camp. Not a real park.'
  ),
  pub(
    'pub-demo-27',
    'Lakeshore Recreation Camp',
    'Apex Vale',
    'NC',
    35.737,
    -79.017,
    'Demo sample lake recreation camp. Fictional only.'
  ),
  pub(
    'pub-demo-28',
    'Gorge Overlook Camp',
    'Castile Bend',
    'NY',
    42.585,
    -78.052,
    'Demo sample gorge camp. Not a real facility.'
  ),
  pub(
    'pub-demo-29',
    'Falls Trail Camp',
    'Benton Hollow',
    'PA',
    41.338,
    -76.293,
    'Demo sample waterfall-trail camp. Fictional data.'
  ),
  pub(
    'pub-demo-30',
    'Bluff Lake Camp',
    'Baraboo Ridge',
    'WI',
    43.418,
    -89.727,
    'Demo sample bluff lake camp. Not a real park.'
  ),
  pub(
    'pub-demo-31',
    'Headwaters Demo Camp',
    'Parkline',
    'MN',
    47.194,
    -95.21,
    'Demo sample headwaters camp. Fictional listing only.'
  ),
  pub(
    'pub-demo-32',
    'Foothill Gate Camp',
    'Golden Vale',
    'CO',
    39.814,
    -105.411,
    'Demo sample foothills camp. Not a real business.'
  ),
  pub(
    'pub-demo-33',
    'Silver Falls Loop Camp',
    'Sublime Creek',
    'OR',
    44.878,
    -122.655,
    'Demo sample waterfall loop camp. Fictional data.'
  ),
  pub(
    'pub-demo-34',
    'Passage Bridge Camp',
    'Oak Harbor Demo',
    'WA',
    48.406,
    -122.646,
    'Demo sample saltwater camp. Not a real park.'
  ),
  pub(
    'pub-demo-35',
    'Creek Pine Forest Camp',
    'Oak Hollow',
    'AZ',
    34.915,
    -111.72,
    'Demo sample forest creek camp. Fictional only.'
  ),
  pub(
    'pub-demo-36',
    'High Valley Forest Camp',
    'Aspen Gate',
    'CO',
    39.158,
    -106.819,
    'Demo sample high-valley camp. Not a real facility.'
  ),
  pub(
    'pub-demo-37',
    'Castle Lake Demo Camp',
    'Shasta Vale',
    'CA',
    41.228,
    -122.318,
    'Demo sample alpine lake camp. Fictional listing.'
  ),
  pub(
    'pub-demo-38',
    'River Island Demo Camp',
    'Moab Vale',
    'UT',
    38.721,
    -109.536,
    'Demo sample riverside camp. Not a real BLM or private site.',
    ['Camping', 'Restrooms'],
    20
  ),
  pub(
    'pub-demo-39',
    'Arch Rock Demo Camp',
    'Overton Gap',
    'NV',
    36.428,
    -114.532,
    'Demo sample rock-arch camp. Fictional data only.',
    ['Camping'],
    20
  ),
];
