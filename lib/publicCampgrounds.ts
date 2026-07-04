import type { Park } from './parks';

/**
 * Campgrounds from free public sources only — federal and state recreation
 * agencies (NPS, USFS, BLM, state parks). Same facts published on agency
 * websites and findable via public search. No commercial directories or scraping.
 */
export const PUBLIC_CAMPGROUND_SOURCES = [
  'nps.gov',
  'recreation.gov',
  'fs.usda.gov',
  'blm.gov',
  'state-parks',
] as const;

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
  source: PublicCampgroundSource,
  sourceUrl: string,
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
    verified_by: 'public listing',
    source,
    sourceUrl,
  };
}

/** Curated from publicly published agency campground pages. */
export const publicCampgrounds: PublicCampground[] = [
  // Arizona — NPS / USFS
  pub('pub-mather', 'Mather Campground', 'Grand Canyon Village', 'AZ', 36.054, -112.139, 'South Rim developed campground in Grand Canyon National Park. Public NPS listing.', 'nps.gov', 'https://www.nps.gov/grca/planyourvisit/mather-campground.htm', ['Camping', 'Restrooms', 'Dump Station'], 18),
  pub('pub-desert-view', 'Desert View Campground', 'Grand Canyon', 'AZ', 36.046, -111.823, 'East Rim campground on the South Rim scenic drive. NPS public listing.', 'nps.gov', 'https://www.nps.gov/grca/planyourvisit/camping.htm'),
  pub('pub-watchman', 'Watchman Campground', 'Springdale', 'UT', 37.201, -112.989, 'Zion National Park campground near the south entrance. Public NPS listing.', 'nps.gov', 'https://www.nps.gov/zion/planyourvisit/campgrounds-in-zion.htm', ['Camping', 'Electric', 'Restrooms'], 20),
  pub('pub-south-camp', 'South Campground', 'Springdale', 'UT', 37.205, -112.995, 'First-come campground in Zion National Park. Public NPS listing.', 'nps.gov', 'https://www.nps.gov/zion/planyourvisit/campgrounds-in-zion.htm'),
  pub('pub-north-rim', 'North Rim Campground', 'North Rim', 'AZ', 36.212, -112.061, 'Seasonal North Rim campground in Grand Canyon National Park.', 'nps.gov', 'https://www.nps.gov/grca/planyourvisit/camping.htm'),

  // California — NPS / USFS
  pub('pub-upper-pines', 'Upper Pines Campground', 'Yosemite Village', 'CA', 37.739, -119.558, 'Popular Yosemite Valley campground. Public NPS listing.', 'nps.gov', 'https://www.nps.gov/yose/planyourvisit/campground.htm', ['Camping', 'Restrooms', 'Food Storage'], 26),
  pub('pub-north-pines', 'North Pines Campground', 'Yosemite Village', 'CA', 37.742, -119.585, 'Yosemite Valley campground along the Merced River.', 'nps.gov', 'https://www.nps.gov/yose/planyourvisit/campground.htm', ['Camping', 'Restrooms'], 26),
  pub('pub-wawona', 'Wawona Campground', 'Wawona', 'CA', 37.536, -119.657, 'Near the Mariposa Grove in Yosemite National Park.', 'nps.gov', 'https://www.nps.gov/yose/planyourvisit/campground.htm'),
  pub('pub-joshua-tree', 'Jumbo Rocks Campground', 'Twentynine Palms', 'CA', 34.013, -116.067, 'Iconic desert campground in Joshua Tree National Park.', 'nps.gov', 'https://www.nps.gov/jotr/planyourvisit/camping.htm', ['Camping', 'Restrooms'], 20),
  pub('pub-death-valley', 'Furnace Creek Campground', 'Death Valley', 'CA', 36.463, -116.868, 'Main developed campground in Death Valley National Park.', 'nps.gov', 'https://www.nps.gov/deva/planyourvisit/camping.htm', ['Camping', 'Restrooms', 'Dump Station'], 22),
  pub('pub-sequoia', 'Potwisha Campground', 'Three Rivers', 'CA', 36.548, -118.772, 'Lower-elevation campground in Sequoia National Park.', 'nps.gov', 'https://www.nps.gov/seki/planyourvisit/camping.htm'),

  // Colorado — NPS / USFS
  pub('pub-glacier-basin', 'Glacier Basin Campground', 'Estes Park', 'CO', 40.318, -105.545, 'Rocky Mountain National Park campground on the east side.', 'nps.gov', 'https://www.nps.gov/romo/planyourvisit/camping.htm', ['Camping', 'Restrooms'], 30),
  pub('pub-moraine-park', 'Moraine Park Campground', 'Estes Park', 'CO', 40.358, -105.592, 'Large east-side campground in Rocky Mountain National Park.', 'nps.gov', 'https://www.nps.gov/romo/planyourvisit/camping.htm', ['Camping', 'Restrooms', 'Dump Station'], 30),
  pub('pub-great-sand-dunes', 'Piñon Flats Campground', 'Mosca', 'CO', 37.734, -105.512, 'Developed campground in Great Sand Dunes National Park.', 'nps.gov', 'https://www.nps.gov/grsa/planyourvisit/camping.htm'),

  // Florida — NPS
  pub('pub-long-pine-key', 'Long Pine Key Campground', 'Homestead', 'FL', 25.429, -80.676, 'Everglades National Park campground near the main park road.', 'nps.gov', 'https://www.nps.gov/ever/planyourvisit/camping.htm', ['Camping', 'Restrooms'], 30),
  pub('pub-flamingo', 'Flamingo Campground', 'Flamingo', 'FL', 25.141, -80.926, 'South Everglades campground on Florida Bay.', 'nps.gov', 'https://www.nps.gov/ever/planyourvisit/camping.htm'),

  // Georgia — NPS
  pub('pub-cumberland-island', 'Sea Camp Campground', 'St. Marys', 'GA', 30.762, -81.424, 'Main campground on Cumberland Island National Seashore.', 'nps.gov', 'https://www.nps.gov/cuis/planyourvisit/camping.htm'),

  // Maine — NPS
  pub('pub-blackwoods', 'Blackwoods Campground', 'Bar Harbor', 'ME', 44.338, -68.207, 'Popular Acadia National Park campground near the coast.', 'nps.gov', 'https://www.nps.gov/acad/planyourvisit/camping.htm', ['Camping', 'Restrooms'], 30),
  pub('pub-seawall', 'Seawall Campground', 'Southwest Harbor', 'ME', 44.240, -68.309, 'Quieter west-side Acadia campground.', 'nps.gov', 'https://www.nps.gov/acad/planyourvisit/camping.htm'),

  // Michigan — NPS
  pub('pub-sleeping-bear-dh', 'D.H. Day Campground', 'Glen Arbor', 'MI', 44.897, -86.023, 'Sleeping Bear Dunes National Lakeshore campground.', 'nps.gov', 'https://www.nps.gov/slbe/planyourvisit/camping.htm'),

  // Montana / Wyoming — NPS
  pub('pub-madison', 'Madison Campground', 'West Yellowstone', 'MT', 44.645, -110.858, 'Yellowstone National Park campground near the west entrance.', 'nps.gov', 'https://www.nps.gov/yell/planyourvisit/camping.htm', ['Camping', 'Restrooms'], 32),
  pub('pub-bridge-bay', 'Bridge Bay Campground', 'Yellowstone', 'WY', 44.535, -110.421, 'Lake-area campground in Yellowstone National Park.', 'nps.gov', 'https://www.nps.gov/yell/planyourvisit/camping.htm'),
  pub('pub-grant-village', 'Grant Village Campground', 'Yellowstone', 'WY', 44.389, -110.565, 'Southwest Yellowstone campground near Yellowstone Lake.', 'nps.gov', 'https://www.nps.gov/yell/planyourvisit/camping.htm'),
  pub('pub-mammoth', 'Mammoth Campground', 'Mammoth', 'WY', 44.976, -110.701, 'Year-round campground near Mammoth Hot Springs.', 'nps.gov', 'https://www.nps.gov/yell/planyourvisit/camping.htm'),
  pub('pub-many-glacier', 'Many Glacier Campground', 'Babb', 'MT', 48.796, -113.657, 'Scenic Glacier National Park campground.', 'nps.gov', 'https://www.nps.gov/glac/planyourvisit/camping.htm'),
  pub('pub-st-mary', 'St. Mary Campground', 'St. Mary', 'MT', 48.748, -113.437, 'East-side Glacier National Park campground.', 'nps.gov', 'https://www.nps.gov/glac/planyourvisit/camping.htm'),

  // North Carolina / Tennessee — NPS
  pub('pub-smokemont', 'Smokemont Campground', 'Cherokee', 'NC', 35.556, -83.311, 'Great Smoky Mountains National Park campground.', 'nps.gov', 'https://www.nps.gov/grsm/planyourvisit/camping.htm', ['Camping', 'Restrooms'], 25),
  pub('pub-elkmont', 'Elkmont Campground', 'Gatlinburg', 'TN', 35.653, -83.594, 'Popular Smokies campground near Gatlinburg.', 'nps.gov', 'https://www.nps.gov/grsm/planyourvisit/camping.htm'),
  pub('pub-cades-cove', 'Cades Cove Campground', 'Townsend', 'TN', 35.595, -83.812, 'Historic valley campground in Great Smoky Mountains.', 'nps.gov', 'https://www.nps.gov/grsm/planyourvisit/camping.htm'),

  // Oregon / Washington — NPS / USFS
  pub('pub-crater-lake', 'Crater Lake Mazama Campground', 'Crater Lake', 'OR', 42.868, -122.168, 'Main campground in Crater Lake National Park.', 'nps.gov', 'https://www.nps.gov/crla/planyourvisit/camping.htm'),
  pub('pub-olympic-hoh', 'Hoh Campground', 'Forks', 'WA', 47.859, -123.934, 'Rainforest campground in Olympic National Park.', 'nps.gov', 'https://www.nps.gov/olym/planyourvisit/camping.htm'),
  pub('pub-rainier-cougar', 'Cougar Rock Campground', 'Ashford', 'WA', 46.756, -121.814, 'Mount Rainier National Park southwest campground.', 'nps.gov', 'https://www.nps.gov/mora/planyourvisit/camping.htm'),
  pub('pub-north-cascades', 'Newhalem Creek Campground', 'Marblemount', 'WA', 48.612, -121.437, 'North Cascades National Park Service complex campground.', 'nps.gov', 'https://www.nps.gov/noca/planyourvisit/camping.htm'),

  // South Dakota — NPS
  pub('pub-badlands-sage', 'Sage Creek Campground', 'Interior', 'SD', 43.736, -102.365, 'Primitive Badlands National Park campground.', 'nps.gov', 'https://www.nps.gov/badl/planyourvisit/camping.htm', ['Camping'], 0),
  pub('pub-badlands-cedar', 'Cedar Pass Campground', 'Interior', 'SD', 43.742, -102.164, 'Developed Badlands National Park campground.', 'nps.gov', 'https://www.nps.gov/badl/planyourvisit/camping.htm'),

  // Texas — NPS
  pub('pub-big-bend-chisos', 'Chisos Basin Campground', 'Big Bend', 'TX', 29.253, -103.244, 'Mountain basin campground in Big Bend National Park.', 'nps.gov', 'https://www.nps.gov/bibe/planyourvisit/camping.htm', ['Camping', 'Restrooms'], 16),
  pub('pub-big-bend-rio', 'Rio Grande Village Campground', 'Big Bend', 'TX', 29.169, -102.960, 'Riverside desert campground in Big Bend.', 'nps.gov', 'https://www.nps.gov/bibe/planyourvisit/camping.htm'),

  // Utah — NPS
  pub('pub-devils-garden', 'Devils Garden Campground', 'Moab', 'UT', 38.782, -109.592, 'Arches National Park campground.', 'nps.gov', 'https://www.nps.gov/arch/planyourvisit/camping.htm'),
  pub('pub-island-royale', 'Willow Flat Campground', 'Moab', 'UT', 38.462, -109.821, 'Canyonlands Island in the Sky district campground.', 'nps.gov', 'https://www.nps.gov/cany/planyourvisit/camping.htm'),
  pub('pub-bryce-sunset', 'Sunset Campground', 'Bryce', 'UT', 37.628, -112.167, 'Bryce Canyon National Park campground.', 'nps.gov', 'https://www.nps.gov/brca/planyourvisit/camping.htm'),
  pub('pub-capitol-reef', 'Fruita Campground', 'Torrey', 'UT', 38.287, -111.247, 'Orchard-area campground in Capitol Reef National Park.', 'nps.gov', 'https://www.nps.gov/care/planyourvisit/camping.htm'),

  // Virginia — NPS
  pub('pub-shenandoah-mathews', 'Mathews Arm Campground', 'Luray', 'VA', 38.612, -78.332, 'North district campground in Shenandoah National Park.', 'nps.gov', 'https://www.nps.gov/shen/planyourvisit/camping.htm'),
  pub('pub-shenandoah-big', 'Big Meadows Campground', 'Stanley', 'VA', 38.522, -78.437, 'Central Shenandoah campground near meadows and trails.', 'nps.gov', 'https://www.nps.gov/shen/planyourvisit/camping.htm'),

  // State parks — public agency listings
  pub('pub-tx-guadalupe', 'Guadalupe River State Park Campground', 'Spring Branch', 'TX', 29.874, -98.478, 'Texas State Parks public campground along the Guadalupe River.', 'state-parks', 'https://tpwd.texas.gov/state-parks/guadalupe-river', ['Camping', 'Restrooms', 'Water'], 15),
  pub('pub-tx-palo-duro', 'Palo Duro Canyon State Park Campground', 'Canyon', 'TX', 34.986, -101.682, 'Texas State Parks campground in the Palo Duro Canyon.', 'state-parks', 'https://tpwd.texas.gov/state-parks/palo-duro-canyon'),
  pub('pub-ca-big-sur', 'Pfeiffer Big Sur State Park Campground', 'Big Sur', 'CA', 36.247, -121.782, 'California State Parks redwood canyon campground.', 'state-parks', 'https://www.parks.ca.gov/?page_id=570'),
  pub('pub-ca-anzaborrego', 'Borrego Palm Canyon Campground', 'Borrego Springs', 'CA', 33.270, -116.407, 'Anza-Borrego Desert State Park public campground.', 'state-parks', 'https://www.parks.ca.gov/?page_id=637'),
  pub('pub-fl-myakka', 'Myakka River State Park Campground', 'Sarasota', 'FL', 27.242, -82.304, 'Florida State Parks prairie and river campground.', 'state-parks', 'https://www.floridastateparks.org/parks-and-trails/myakka-river-state-park'),
  pub('pub-ga-cloudland', 'Cloudland Canyon State Park Campground', 'Rising Fawn', 'GA', 34.834, -85.473, 'Georgia State Parks canyon rim campground.', 'state-parks', 'https://gastateparks.org/CloudlandCanyon'),
  pub('pub-nc-jordan-lake', 'Jordan Lake State Recreation Area Campground', 'Apex', 'NC', 35.737, -79.017, 'North Carolina State Parks lake recreation campground.', 'state-parks', 'https://www.ncparks.gov/jordan-lake-state-recreation-area'),
  pub('pub-ny-letchworth', 'Letchworth State Park Campground', 'Castile', 'NY', 42.585, -78.052, 'New York State Parks gorge campground.', 'state-parks', 'https://parks.ny.gov/parks/letchworth'),
  pub('pub-pa-ricketts', 'Ricketts Glen State Park Campground', 'Benton', 'PA', 41.338, -76.293, 'Pennsylvania State Parks waterfall trail campground.', 'state-parks', 'https://www.dcnr.pa.gov/StateParks/FindAPark/RickettsGlenStatePark'),
  pub('pub-wi-devils-lake', 'Devils Lake State Park Campground', 'Baraboo', 'WI', 43.418, -89.727, 'Wisconsin State Parks quartzite bluff campground.', 'state-parks', 'https://dnr.wisconsin.gov/topic/parks/devilslake'),
  pub('pub-mn-itasca', 'Itasca State Park Campground', 'Park Rapids', 'MN', 47.194, -95.210, 'Minnesota State Parks headwaters of the Mississippi campground.', 'state-parks', 'https://www.dnr.state.mn.us/state_parks/park.html?id=spk00185'),
  pub('pub-co-golden-gate', 'Golden Gate Canyon State Park Campground', 'Golden', 'CO', 39.814, -105.411, 'Colorado State Parks foothills campground.', 'state-parks', 'https://cpw.state.co.us/placestogo/parks/GoldenGateCanyon'),
  pub('pub-or-silver-falls', 'Silver Falls State Park Campground', 'Sublimity', 'OR', 44.878, -122.655, 'Oregon State Parks waterfall loop campground.', 'state-parks', 'https://stateparks.oregon.gov/index.cfm?do=park.profile&parkId=151'),
  pub('pub-wa-deception-pass', 'Deception Pass State Park Campground', 'Oak Harbor', 'WA', 48.406, -122.646, 'Washington State Parks bridge and saltwater campground.', 'state-parks', 'https://parks.wa.gov/find-parks/state-parks/deception-pass-state-park'),

  // USFS — public forest service campground pages
  pub('pub-fs-sedona', 'Manzanita Campground', 'Sedona', 'AZ', 34.915, -111.720, 'Coconino National Forest campground near Oak Creek.', 'fs.usda.gov', 'https://www.fs.usda.gov/recarea/coconino/recarea/?recid=55072'),
  pub('pub-fs-aspen', 'Difficult Campground', 'Aspen', 'CO', 39.158, -106.819, 'White River National Forest campground near Aspen.', 'fs.usda.gov', 'https://www.fs.usda.gov/recarea/whiteriver/recarea/?recid=40543'),
  pub('pub-fs-shasta', 'Castle Lake Campground', 'Mt. Shasta', 'CA', 41.228, -122.318, 'Shasta-Trinity National Forest alpine lake campground.', 'fs.usda.gov', 'https://www.fs.usda.gov/recarea/stnf/recarea/?recid=41178'),
  pub('pub-fs-smokey', 'Cataloochee Campground', 'Waynesville', 'NC', 35.628, -83.107, 'Great Smoky Mountains area Pisgah National Forest campground.', 'fs.usda.gov', 'https://www.fs.usda.gov/recarea/nfsnc/recarea/?recid=38527'),

  // BLM — public bureau listings
  pub('pub-blm-moab', 'Goose Island Campground', 'Moab', 'UT', 38.721, -109.536, 'BLM Colorado River campground near Moab.', 'blm.gov', 'https://www.blm.gov/visit/goose-island-campground', ['Camping', 'Restrooms'], 20),
  pub('pub-blm-valley-of-fire', 'Arch Rock Campground', 'Overton', 'NV', 36.428, -114.532, 'BLM Valley of Fire recreation area campground.', 'blm.gov', 'https://www.blm.gov/visit/valley-of-fire', ['Camping'], 20),
];