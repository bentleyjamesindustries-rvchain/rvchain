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
  /** Public listing source (e.g. nps.gov) when from free agency data */
  source?: string;
  sourceUrl?: string;
}

export const parks: Park[] = [
  {
    id: "p1", name: "West Yellowstone RV Resort", city: "West Yellowstone", state: "MT",
    lat: 44.659, lng: -111.099, rating: 4.6, price: 55,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Laundry", "50 Amp"],
    description: "Just minutes from Yellowstone's west entrance. Spacious sites, clean facilities, and incredible wildlife viewing at sunrise.",
    image: "https://picsum.photos/id/1018/800/400"
  },
  {
    id: "p2", name: "Zion Canyon Campground & RV Resort", city: "Springdale", state: "UT",
    lat: 37.188, lng: -113.004, rating: 4.8, price: 68,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Pool", "Laundry"],
    description: "Stunning red rock views. Walk or shuttle straight into Zion National Park. Great for hikers and photographers.",
    image: "https://picsum.photos/id/1005/800/400"
  },
  {
    id: "p3", name: "Grand Canyon Trailer Village", city: "Tusayan", state: "AZ",
    lat: 35.973, lng: -112.142, rating: 4.3, price: 42,
    amenities: ["Full Hookups", "Dump Station", "Pet Friendly", "Store"],
    description: "The closest full-service RV park to the South Rim. Quiet at night and perfect for early park entry.",
    image: "https://picsum.photos/id/160/800/400"
  },
  {
    id: "p4", name: "Lake Powell RV Park", city: "Page", state: "AZ",
    lat: 36.912, lng: -111.455, rating: 4.5, price: 49,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Laundry", "Propane"],
    description: "Beautiful views of Lake Powell. Easy access to boat launches and Antelope Canyon tours.",
    image: "https://picsum.photos/id/251/800/400"
  },
  {
    id: "p5", name: "Yosemite South Coast RV Resort", city: "Oakhurst", state: "CA",
    lat: 37.328, lng: -119.649, rating: 4.7, price: 72,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Pool", "Laundry"],
    description: "Gateway to Yosemite. Large pull-throughs and excellent stargazing. Great base for day trips into the park.",
    image: "https://picsum.photos/id/1033/800/400"
  },
  {
    id: "p6", name: "Morro Bay RV Park & Campground", city: "Morro Bay", state: "CA",
    lat: 35.366, lng: -120.849, rating: 4.4, price: 58,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Laundry", "Dump Station"],
    description: "Right on the coast with incredible ocean and Morro Rock views. Perfect for whale watching season.",
    image: "https://picsum.photos/id/201/800/400"
  },
  {
    id: "p7", name: "Redwood Coast RV Resort", city: "Crescent City", state: "CA",
    lat: 41.753, lng: -124.195, rating: 4.9, price: 65,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Laundry"],
    description: "Among the tallest trees on Earth. Quiet, clean, and the perfect jumping-off point for exploring the redwoods.",
    image: "https://picsum.photos/id/29/800/400"
  },
  {
    id: "p8", name: "Columbia River Gorge RV Park", city: "Hood River", state: "OR",
    lat: 45.705, lng: -121.521, rating: 4.6, price: 52,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Laundry", "50 Amp"],
    description: "Wind sports capital of the world. Incredible gorge views and close to dozens of waterfalls.",
    image: "https://picsum.photos/id/133/800/400"
  },
  {
    id: "p9", name: "Mount Rainier RV Resort", city: "Ashford", state: "WA",
    lat: 46.756, lng: -121.998, rating: 4.5, price: 60,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Pool", "Store"],
    description: "Breathtaking views of Mount Rainier. Close to the Nisqually entrance and Paradise area.",
    image: "https://picsum.photos/id/180/800/400"
  },
  {
    id: "p10", name: "Rocky Mountain RV Park", city: "Estes Park", state: "CO",
    lat: 40.376, lng: -105.511, rating: 4.7, price: 75,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Laundry", "50 Amp"],
    description: "Just outside Rocky Mountain National Park. Elk often wander through the property at dawn.",
    image: "https://picsum.photos/id/251/800/400"
  },
  {
    id: "p11", name: "Badlands RV Resort", city: "Wall", state: "SD",
    lat: 43.992, lng: -102.244, rating: 4.2, price: 38,
    amenities: ["Full Hookups", "Dump Station", "Pet Friendly", "Store"],
    description: "Close to Badlands National Park and Wall Drug. Dramatic landscapes and dark skies.",
    image: "https://picsum.photos/id/1005/800/400"
  },
  {
    id: "p12", name: "Hill Country RV Resort", city: "Kerrville", state: "TX",
    lat: 30.047, lng: -99.145, rating: 4.8, price: 48,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Pool", "Laundry"],
    description: "Beautiful Texas Hill Country. Great for wine tasting and exploring the Guadalupe River.",
    image: "https://picsum.photos/id/160/800/400"
  },
  {
    id: "p13", name: "Gulf Coast RV Park", city: "Galveston", state: "TX",
    lat: 29.287, lng: -94.797, rating: 4.3, price: 45,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Laundry", "Pool"],
    description: "Beach access and close to the historic Strand district. Perfect for winter Texans.",
    image: "https://picsum.photos/id/201/800/400"
  },
  {
    id: "p14", name: "Big Bend RV Village", city: "Terlingua", state: "TX",
    lat: 29.316, lng: -103.615, rating: 4.6, price: 52,
    amenities: ["Full Hookups", "Pet Friendly", "Dump Station", "Propane"],
    description: "Dark sky sanctuary next to Big Bend National Park. Incredible stargazing and desert solitude.",
    image: "https://picsum.photos/id/29/800/400"
  },
  {
    id: "p15", name: "Everglades RV Resort", city: "Homestead", state: "FL",
    lat: 25.462, lng: -80.477, rating: 4.4, price: 55,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Pool", "Laundry"],
    description: "Gateway to Everglades National Park and the Florida Keys. Great birding and airboat tours nearby.",
    image: "https://picsum.photos/id/251/800/400"
  },
  {
    id: "p16", name: "Key West RV Resort", city: "Key West", state: "FL",
    lat: 24.554, lng: -81.755, rating: 4.1, price: 82,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Pool", "Laundry"],
    description: "The southernmost RV resort in the continental U.S. Walk to Duval Street and the sunset celebration.",
    image: "https://picsum.photos/id/1005/800/400"
  },
  {
    id: "p17", name: "Blue Ridge Mountain RV Park", city: "Cherokee", state: "NC",
    lat: 35.486, lng: -83.315, rating: 4.7, price: 47,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Laundry"],
    description: "In the heart of the Great Smoky Mountains. Close to the Blue Ridge Parkway and Cherokee casinos.",
    image: "https://picsum.photos/id/133/800/400"
  },
  {
    id: "p18", name: "Great Smoky Mountains RV Resort", city: "Pigeon Forge", state: "TN",
    lat: 35.787, lng: -83.554, rating: 4.5, price: 58,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Pool", "Laundry"],
    description: "Perfect base for Dollywood and the national park. Family-friendly with lots of activities.",
    image: "https://picsum.photos/id/180/800/400"
  },
  {
    id: "p19", name: "Adirondack RV Park", city: "Lake George", state: "NY",
    lat: 43.421, lng: -73.712, rating: 4.3, price: 52,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Laundry"],
    description: "Beautiful mountain lake setting. Boating, hiking, and the famous Lake George village nearby.",
    image: "https://picsum.photos/id/1033/800/400"
  },
  {
    id: "p20", name: "Acadia RV Resort", city: "Bar Harbor", state: "ME",
    lat: 44.388, lng: -68.203, rating: 4.8, price: 69,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Laundry", "50 Amp"],
    description: "Steps from Acadia National Park and the stunning coastline of Maine. Incredible fall colors.",
    image: "https://picsum.photos/id/29/800/400"
  },
  {
    id: "p21", name: "Sleeping Bear Dunes RV Park", city: "Glen Arbor", state: "MI",
    lat: 44.895, lng: -85.986, rating: 4.6, price: 48,
    amenities: ["Full Hookups", "Pet Friendly", "Dump Station", "Store"],
    description: "One of America's most beautiful places. Turquoise water and massive sand dunes.",
    image: "https://picsum.photos/id/201/800/400"
  },
  {
    id: "p22", name: "Boundary Waters RV Campground", city: "Ely", state: "MN",
    lat: 47.902, lng: -91.867, rating: 4.4, price: 39,
    amenities: ["Full Hookups", "Pet Friendly", "Dump Station", "Propane"],
    description: "True wilderness experience. Launch your canoe into the Boundary Waters from here.",
    image: "https://picsum.photos/id/133/800/400"
  },
  {
    id: "p23", name: "Yellowstone River RV Park", city: "Livingston", state: "MT",
    lat: 45.661, lng: -110.564, rating: 4.5, price: 44,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Laundry"],
    description: "Excellent fishing and a beautiful setting along the Yellowstone River. Less crowded than West Yellowstone.",
    image: "https://picsum.photos/id/160/800/400"
  },
  {
    id: "p24", name: "Sedona Red Rock RV Resort", city: "Sedona", state: "AZ",
    lat: 34.863, lng: -111.812, rating: 4.9, price: 78,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Pool", "Laundry"],
    description: "Vortex energy and red rock majesty. Many sites have direct views of Cathedral Rock.",
    image: "https://picsum.photos/id/251/800/400"
  },
  {
    id: "p25", name: "Outer Banks RV Resort", city: "Nags Head", state: "NC",
    lat: 35.943, lng: -75.624, rating: 4.2, price: 61,
    amenities: ["Full Hookups", "WiFi", "Pet Friendly", "Pool", "Laundry"],
    description: "Beachfront access on the beautiful Outer Banks. Great for kiteboarding and wild horses.",
    image: "https://picsum.photos/id/1005/800/400"
  }
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
