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

/** Bumped so old seed posts with real place/brand names are not reloaded from cache. */
const STORAGE_KEY = 'rvchain_forum_posts_v2';

/** Fictional demo posts — invented places and tips, not real venues or brands. */
const SEED_POSTS: ForumPost[] = [
  {
    id: 'seed-rv-dest-1',
    category: 'rv',
    subcategory: 'destinations',
    title: 'Red Mesa Rest — site 12 at sunset',
    body: 'Demo post: fictional red-rock loop at sunset from site 12. Full hookups vibe. Sample community content only — not a real park review.',
    author: 'DemoNomad',
    createdAt: '2026-06-15T14:00:00.000Z',
  },
  {
    id: 'seed-tent-dest-1',
    category: 'tent',
    subcategory: 'destinations',
    title: 'Dispersed pull-offs near Coppercliff',
    body: 'Demo post: fictional forest road pull-offs with fire rings. Pack water. Sample tip only — not real access rules for any public land.',
    author: 'DemoTrekker',
    createdAt: '2026-06-14T10:30:00.000Z',
  },
  {
    id: 'seed-all-dest-1',
    category: 'all',
    subcategory: 'destinations',
    title: 'Riverstone Pads as a quieter base',
    body: 'Demo post: fictional riverside town stays quieter than the main gate. Sample discussion — not a real reservation tip.',
    author: 'DemoFullTimer',
    createdAt: '2026-06-13T18:00:00.000Z',
  },
  {
    id: 'seed-rv-con-1',
    category: 'rv',
    subcategory: 'construction',
    title: 'Demo highway work east of Highpass',
    body: 'Demo alert: sample single-lane controls. Add 20–30 min if hauling. Fictional road note for UI only.',
    author: 'DemoRoad42',
    createdAt: '2026-06-16T08:00:00.000Z',
  },
  {
    id: 'seed-all-con-1',
    category: 'all',
    subcategory: 'construction',
    title: 'Coastal detour sample near Seacliff',
    body: 'Demo alert: sample 45-minute detour. Fictional routing tip — not a real DOT notice.',
    author: 'DemoCoastal',
    createdAt: '2026-06-12T12:00:00.000Z',
  },
  {
    id: 'seed-tent-con-1',
    category: 'tent',
    subcategory: 'construction',
    title: 'Trail loop closed for demo erosion work',
    body: 'Demo post: fictional trail reroute for erosion repair. Sample content only.',
    author: 'DemoHiker',
    createdAt: '2026-06-11T09:00:00.000Z',
  },
  {
    id: 'seed-rv-maint-1',
    category: 'rv',
    subcategory: 'maintenance',
    title: 'Black tank sensor false readings',
    body: 'Demo tip: flush thoroughly, then clean sensors when the tank is empty. Generic maintenance talk — no product brands named.',
    author: 'DemoGrannyPat',
    createdAt: '2026-06-10T16:00:00.000Z',
  },
  {
    id: 'seed-tent-maint-1',
    category: 'tent',
    subcategory: 'maintenance',
    title: 'Re-waterproofing a rain fly',
    body: 'Demo tip: clean dry fly, light coats of a generic tent waterproofing spray. Sample post only.',
    author: 'DemoWander',
    createdAt: '2026-06-09T11:00:00.000Z',
  },
  {
    id: 'seed-all-maint-1',
    category: 'all',
    subcategory: 'maintenance',
    title: 'Portable power station sizing',
    body: 'Demo tip: fridge + phones + LED overnight often needs ~500Wh; more if you run medical gear. Generic advice for UI sample.',
    author: 'DemoOffGrid',
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
