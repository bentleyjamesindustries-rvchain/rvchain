import { supabase, isSupabaseConfigured } from './supabaseClient';

export type MarketKind = 'gear' | 'parts';
export type MarketCondition = 'new' | 'like-new' | 'good' | 'fair' | 'for-parts';
export type MarketStatus = 'active' | 'sold' | 'deleted';

export const FREE_ACTIVE_LISTING_LIMIT = 3;
export const MAX_LISTING_PHOTOS = 6;

export const GEAR_CATEGORIES: Record<string, string> = {
  kitchen: 'Kitchen & coolers',
  shelter: 'Shelter & sleep',
  power: 'Power & solar',
  comfort: 'Comfort & seating',
  outdoor: 'Outdoor & fire',
  safety: 'Safety',
  powersports: 'Powersports (ATV / dirt / snow)',
  overland: 'Overland & truck camp',
  riding: 'Helmets, boots & riding gear',
  recovery: 'Recovery & winch gear',
  other: 'Other gear',
};

export const PARTS_CATEGORIES: Record<string, string> = {
  towing: 'Towing & hitch',
  tires: 'Tires & wheels',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  covers: 'Covers & protection',
  hardware: 'Hardware',
  drivetrain: 'Drivetrain & suspension',
  snow: 'Snowmobile parts',
  atv: 'ATV / UTV parts',
  dirtbike: 'Dirt bike parts',
  other: 'Other parts',
};

export const CONDITION_LABELS: Record<MarketCondition, string> = {
  new: 'New',
  'like-new': 'Like new',
  good: 'Good',
  fair: 'Fair',
  'for-parts': 'For parts',
};

export interface MarketListing {
  id: string;
  user_id: string;
  kind: MarketKind;
  title: string;
  description: string;
  price: number;
  condition: MarketCondition;
  city: string;
  state: string;
  category: string;
  images: string[];
  contact_email: string | null;
  contact_phone: string | null;
  featured: boolean;
  status: MarketStatus;
  created_at: string;
  updated_at: string;
  seller_name?: string | null;
  seller_pro?: boolean;
}

export interface MarketProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  seller_pro: boolean;
  ai_pro?: boolean;
  is_admin?: boolean;
  avatar_url?: string | null;
}

export function formatMarketPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export function categoryLabel(kind: MarketKind, category: string): string {
  const map = kind === 'gear' ? GEAR_CATEGORIES : PARTS_CATEGORIES;
  return map[category] ?? category;
}

function mapRow(row: Record<string, unknown>): MarketListing {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    kind: row.kind as MarketKind,
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    price: Number(row.price ?? 0),
    condition: (row.condition as MarketCondition) || 'good',
    city: String(row.city ?? ''),
    state: String(row.state ?? ''),
    category: String(row.category ?? 'other'),
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    contact_email: (row.contact_email as string) ?? null,
    contact_phone: (row.contact_phone as string) ?? null,
    featured: Boolean(row.featured),
    status: (row.status as MarketStatus) || 'active',
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export async function fetchActiveListings(opts?: {
  kind?: MarketKind | 'all';
  state?: string;
  q?: string;
}): Promise<{ listings: MarketListing[]; error?: string }> {
  if (!isSupabaseConfigured) {
    return { listings: [], error: 'Marketplace database is not configured yet.' };
  }

  let query = supabase
    .from('marketplace_listings')
    .select('*')
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200);

  if (opts?.kind && opts.kind !== 'all') {
    query = query.eq('kind', opts.kind);
  }
  if (opts?.state) {
    query = query.eq('state', opts.state);
  }

  const { data, error } = await query;
  if (error) {
    return {
      listings: [],
      error:
        error.message.includes('does not exist') || error.code === '42P01'
          ? 'Run supabase-marketplace.sql in your Supabase SQL Editor to enable live listings.'
          : error.message,
    };
  }

  let listings = (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
  const q = opts?.q?.trim().toLowerCase();
  if (q) {
    listings = listings.filter((l) =>
      `${l.title} ${l.description} ${l.city} ${l.state} ${l.category}`.toLowerCase().includes(q)
    );
  }

  // Attach seller display names
  const userIds = [...new Set(listings.map((l) => l.user_id))];
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, display_name, seller_pro')
      .in('id', userIds);
    const byId = new Map((profiles ?? []).map((p) => [p.id as string, p]));
    listings = listings.map((l) => {
      const p = byId.get(l.user_id);
      return {
        ...l,
        seller_name: (p?.display_name || p?.username || 'Seller') as string,
        seller_pro: Boolean(p?.seller_pro),
      };
    });
  }

  return { listings };
}

export async function fetchMyListings(userId: string): Promise<MarketListing[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((r) => mapRow(r as Record<string, unknown>));
}

export async function countMyActiveListings(userId: string): Promise<number> {
  if (!isSupabaseConfigured) return 0;
  const { count, error } = await supabase
    .from('marketplace_listings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active');
  if (error) return 0;
  return count ?? 0;
}

export async function fetchMarketProfile(userId: string): Promise<MarketProfile | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    username: data.username,
    display_name: data.display_name,
    contact_email: data.contact_email,
    contact_phone: data.contact_phone,
    seller_pro: Boolean(data.seller_pro),
    ai_pro: Boolean((data as { ai_pro?: boolean }).ai_pro),
    is_admin: Boolean((data as { is_admin?: boolean }).is_admin),
    avatar_url: data.avatar_url,
  };
}

export async function upsertMarketProfile(
  userId: string,
  patch: Partial<Pick<MarketProfile, 'display_name' | 'contact_email' | 'contact_phone' | 'username'>>
): Promise<{ error?: string }> {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    ...patch,
    updated_at: new Date().toISOString(),
  });
  return error ? { error: error.message } : {};
}

export async function canPublishListing(
  userId: string
): Promise<{ ok: boolean; reason?: string; sellerPro: boolean; activeCount: number }> {
  const profile = await fetchMarketProfile(userId);
  const sellerPro = Boolean(profile?.seller_pro);
  const activeCount = await countMyActiveListings(userId);
  if (sellerPro) return { ok: true, sellerPro, activeCount };
  if (activeCount >= FREE_ACTIVE_LISTING_LIMIT) {
    return {
      ok: false,
      sellerPro: false,
      activeCount,
      reason: `Free accounts can have ${FREE_ACTIVE_LISTING_LIMIT} active listings. Upgrade to Seller Pro for unlimited (ask admin for now).`,
    };
  }
  return { ok: true, sellerPro: false, activeCount };
}

export async function createListing(
  userId: string,
  input: {
    kind: MarketKind;
    title: string;
    description: string;
    price: number;
    condition: MarketCondition;
    city: string;
    state: string;
    category: string;
    images: string[];
    contact_email?: string | null;
    contact_phone?: string | null;
    featured?: boolean;
  }
): Promise<{ listing?: MarketListing; error?: string }> {
  const gate = await canPublishListing(userId);
  if (!gate.ok) return { error: gate.reason };

  const profile = await fetchMarketProfile(userId);
  const featured = Boolean(input.featured && profile?.seller_pro);

  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert({
      user_id: userId,
      kind: input.kind,
      title: input.title.trim(),
      description: input.description.trim(),
      price: input.price,
      condition: input.condition,
      city: input.city.trim(),
      state: input.state.trim().toUpperCase().slice(0, 2),
      category: input.category,
      images: input.images,
      contact_email: input.contact_email ?? profile?.contact_email ?? null,
      contact_phone: input.contact_phone ?? profile?.contact_phone ?? null,
      featured,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) return { error: error.message };
  return { listing: mapRow(data as Record<string, unknown>) };
}

export async function updateListing(
  userId: string,
  listingId: string,
  patch: Partial<{
    title: string;
    description: string;
    price: number;
    condition: MarketCondition;
    city: string;
    state: string;
    category: string;
    images: string[];
    contact_email: string | null;
    contact_phone: string | null;
    featured: boolean;
    status: MarketStatus;
    kind: MarketKind;
  }>
): Promise<{ error?: string }> {
  if (patch.featured) {
    const profile = await fetchMarketProfile(userId);
    if (!profile?.seller_pro) {
      return { error: 'Featured listings require Seller Pro.' };
    }
  }

  const { error } = await supabase
    .from('marketplace_listings')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', listingId)
    .eq('user_id', userId);

  return error ? { error: error.message } : {};
}

export async function softDeleteListing(userId: string, listingId: string): Promise<{ error?: string }> {
  return updateListing(userId, listingId, { status: 'deleted' });
}

/** Admin: set featured (moderators) or seller_pro on profile */
export async function adminSetListingFeatured(
  listingId: string,
  featured: boolean
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('marketplace_listings')
    .update({ featured, updated_at: new Date().toISOString() })
    .eq('id', listingId);
  return error ? { error: error.message } : {};
}

export async function adminSetSellerPro(userId: string, sellerPro: boolean): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('profiles')
    .update({ seller_pro: sellerPro, updated_at: new Date().toISOString() })
    .eq('id', userId);
  return error ? { error: error.message } : {};
}

export async function adminSetAiPro(userId: string, aiPro: boolean): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('profiles')
    .update({ ai_pro: aiPro, updated_at: new Date().toISOString() })
    .eq('id', userId);
  return error ? { error: error.message } : {};
}

export async function uploadListingImages(
  userId: string,
  files: File[]
): Promise<{ urls: string[]; error?: string }> {
  if (!isSupabaseConfigured) return { urls: [], error: 'Storage not configured.' };
  const urls: string[] = [];
  const batch = files.slice(0, MAX_LISTING_PHOTOS);

  for (let i = 0; i < batch.length; i++) {
    const file = batch[i];
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${userId}/${Date.now()}-${i}.${ext === 'jpeg' ? 'jpg' : ext}`;
    const { error } = await supabase.storage.from('listing-images').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });
    if (error) {
      // Fall back: try with jpeg
      if (i === 0) return { urls: [], error: error.message };
      break;
    }
    const { data } = supabase.storage.from('listing-images').getPublicUrl(path);
    if (data?.publicUrl) urls.push(data.publicUrl);
  }

  return { urls };
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Contact form requires Supabase. Email admin@rv-chain.com for now.' };
  }
  const { error } = await supabase.from('contact_messages').insert({
    name: input.name.trim() || null,
    email: input.email.trim().toLowerCase(),
    message: input.message.trim(),
  });
  return error ? { error: error.message } : {};
}

export { isSupabaseConfigured };
