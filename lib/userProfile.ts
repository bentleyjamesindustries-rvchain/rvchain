export type ProfilePhotoType = 'trip' | 'setup';

export interface ProfilePhoto {
  id: string;
  dataUrl: string;
  caption: string;
  type: ProfilePhotoType;
  addedAt: string;
}

export interface UserProfile {
  handle: string;
  avatarUrl: string | null;
  photos: ProfilePhoto[];
  updatedAt: string;
}

const GUEST_KEY = 'rvchain_profile_guest';
const MAX_PHOTOS_PER_TYPE = 8;

function storageKey(userId: string) {
  return `rvchain_profile_${userId}`;
}

export function createDefaultProfile(handle = 'RoadWarrior'): UserProfile {
  return {
    handle: handle.trim() || 'RoadWarrior',
    avatarUrl: null,
    photos: [],
    updatedAt: new Date().toISOString(),
  };
}

function migrateLegacyHandle(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('rvchain_handle');
}

export function getProfileUserId(signedInUserId?: string | null): string {
  if (signedInUserId) return signedInUserId;
  if (typeof window === 'undefined') return 'guest';
  let guestId = localStorage.getItem(GUEST_KEY);
  if (!guestId) {
    guestId = `guest-${Date.now()}`;
    localStorage.setItem(GUEST_KEY, guestId);
  }
  return guestId;
}

export function loadUserProfile(userId: string): UserProfile {
  if (typeof window === 'undefined') return createDefaultProfile();
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) {
      const legacy = migrateLegacyHandle();
      return createDefaultProfile(legacy ?? 'RoadWarrior42');
    }
    const parsed = JSON.parse(raw) as UserProfile;
    return {
      handle: parsed.handle?.trim() || 'RoadWarrior',
      avatarUrl: parsed.avatarUrl ?? null,
      photos: Array.isArray(parsed.photos) ? parsed.photos : [],
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return createDefaultProfile();
  }
}

export function saveUserProfile(userId: string, profile: UserProfile): UserProfile {
  const next: UserProfile = {
    ...profile,
    handle: profile.handle.trim().slice(0, 32) || 'RoadWarrior',
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(storageKey(userId), JSON.stringify(next));
  localStorage.setItem('rvchain_handle', next.handle);
  return next;
}

export function getDisplayHandle(
  profile: UserProfile,
  signedInUsername?: string | null
): string {
  return profile.handle.trim() || signedInUsername?.trim() || 'RoadWarrior';
}

export function getProfileInitials(handle: string): string {
  const parts = handle.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'RV';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function countPhotosByType(profile: UserProfile, type: ProfilePhotoType): number {
  return profile.photos.filter((p) => p.type === type).length;
}

export function canAddPhoto(profile: UserProfile, type: ProfilePhotoType): boolean {
  return countPhotosByType(profile, type) < MAX_PHOTOS_PER_TYPE;
}

export function addProfilePhoto(
  profile: UserProfile,
  type: ProfilePhotoType,
  dataUrl: string,
  caption = ''
): UserProfile {
  if (!canAddPhoto(profile, type)) return profile;
  const photo: ProfilePhoto = {
    id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    dataUrl,
    caption: caption.trim().slice(0, 80),
    type,
    addedAt: new Date().toISOString(),
  };
  return { ...profile, photos: [photo, ...profile.photos] };
}

export function removeProfilePhoto(profile: UserProfile, photoId: string): UserProfile {
  return { ...profile, photos: profile.photos.filter((p) => p.id !== photoId) };
}

export { MAX_PHOTOS_PER_TYPE };