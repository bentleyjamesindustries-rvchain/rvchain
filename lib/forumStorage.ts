import type { ForumCategoryId, ForumSubcategoryId } from './forumCategories';

export interface ForumPost {
  id: string;
  category: ForumCategoryId;
  subcategory: ForumSubcategoryId;
  title: string;
  body: string;
  /** Display handle frozen at post time */
  author: string;
  authorAvatar?: string | null;
  userId?: string;
  createdAt: string;
}

const STORAGE_KEY = 'rvchain_forum_posts';

const SEED_POSTS: ForumPost[] = [
  {
    id: 'seed-rv-dest-1',
    category: 'rv',
    subcategory: 'destinations',
    title: 'Zion site 47 at sunset',
    body: 'Just left Zion Canyon RV Resort — the red rocks at sunset from site 47 were unreal. Full hookups, easy big-rig access. Book early in spring.',
    author: 'DesertNomad',
    createdAt: '2026-06-15T14:00:00.000Z',
  },
  {
    id: 'seed-tent-dest-1',
    category: 'tent',
    subcategory: 'destinations',
    title: 'Dispersed camping near Sedona',
    body: 'Forest Road 525 has several pull-offs with fire rings. No facilities — pack water. Red Rock Pass required for day use in some zones.',
    author: 'PineTreeTrekker',
    createdAt: '2026-06-14T10:30:00.000Z',
  },
  {
    id: 'seed-all-dest-1',
    category: 'all',
    subcategory: 'destinations',
    title: 'Yellowstone River RV Park alternative',
    body: 'Livingston MT is way less crowded than West Yellowstone and the fishing on the Yellowstone River is excellent right now. Tent loops are quiet too.',
    author: 'FullTimeRVer',
    createdAt: '2026-06-13T18:00:00.000Z',
  },
  {
    id: 'seed-rv-con-1',
    category: 'rv',
    subcategory: 'construction',
    title: 'I-40 bridge repair east of Flagstaff',
    body: 'Single-lane controls 7am–7pm through July. Add 20–30 min if you are hauling a rig toward Albuquerque. Watch for gusty crosswinds on the approach.',
    author: 'RoadWarrior42',
    createdAt: '2026-06-16T08:00:00.000Z',
  },
  {
    id: 'seed-all-con-1',
    category: 'all',
    subcategory: 'construction',
    title: 'US-101 landslide detour near Florence OR',
    body: 'Expect a 45-minute detour on OR-126. Not recommended for trailers over 30 ft on the alternate — take OR-38 if you are coming from the east.',
    author: 'CoastalCamper',
    createdAt: '2026-06-12T12:00:00.000Z',
  },
  {
    id: 'seed-tent-con-1',
    category: 'tent',
    subcategory: 'construction',
    title: 'Trail closure — Angels Landing permit path',
    body: 'Chain section open but scout trail rerouted for erosion repair. Permit check-in moved to the south lot. Hike boots with grip still mandatory.',
    author: 'SwitchbackSam',
    createdAt: '2026-06-11T09:00:00.000Z',
  },
  {
    id: 'seed-rv-maint-1',
    category: 'rv',
    subcategory: 'maintenance',
    title: 'Black tank sensor false readings',
    body: 'After years of full-timing: flush with ice cubes + Geo Method, then a dedicated tank cleaner. Calibrate only when tank is provably empty.',
    author: 'RVGrannyPat',
    createdAt: '2026-06-10T16:00:00.000Z',
  },
  {
    id: 'seed-tent-maint-1',
    category: 'tent',
    subcategory: 'maintenance',
    title: 'Re-waterproofing a rain fly',
    body: 'Nikwax Tent & Gear SolarProof on a clean dry fly made our 6-year-old tent survive a Gulf Coast downpour. Two light coats > one heavy coat.',
    author: 'WanderWheels',
    createdAt: '2026-06-09T11:00:00.000Z',
  },
  {
    id: 'seed-all-maint-1',
    category: 'all',
    subcategory: 'maintenance',
    title: 'Portable power station sizing',
    body: 'For fridge + phones + LED lights overnight: 500Wh minimum. If you run a CPAP or electric kettle, plan for 1kWh+. Solar input matters more than capacity on long stays.',
    author: 'OffGridOwen',
    createdAt: '2026-06-08T13:00:00.000Z',
  },
];

function readAll(): ForumPost[] {
  if (typeof window === 'undefined') return [...SEED_POSTS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS));
      return [...SEED_POSTS];
    }
    return JSON.parse(raw) as ForumPost[];
  } catch {
    return [...SEED_POSTS];
  }
}

function writeAll(posts: ForumPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function listLocalForumPosts(
  category: ForumCategoryId,
  subcategory: ForumSubcategoryId
): ForumPost[] {
  return readAll()
    .filter((p) => p.category === category && p.subcategory === subcategory)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addLocalForumPost(post: ForumPost): ForumPost {
  const posts = readAll();
  writeAll([post, ...posts]);
  return post;
}

export function formatForumDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}