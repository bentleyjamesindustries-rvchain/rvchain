export type WalletSource = 'created' | 'manual';

export interface WalletProfile {
  bitcoinAddress: string;
  source: WalletSource;
  connectedAt: string;
}

function storageKey(userId: string) {
  return `rvchain_wallet_${userId}`;
}

function normalizeProfile(raw: WalletProfile & { source?: string; coinbaseLinked?: boolean }): WalletProfile {
  return {
    bitcoinAddress: raw.bitcoinAddress,
    source: raw.source === 'created' ? 'created' : 'manual',
    connectedAt: raw.connectedAt,
  };
}

export function loadWalletProfile(userId: string): WalletProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    return normalizeProfile(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveWalletProfile(userId: string, profile: WalletProfile) {
  localStorage.setItem(storageKey(userId), JSON.stringify(profile));
}

export function disconnectWallet(userId: string) {
  localStorage.removeItem(storageKey(userId));
}

export function getWalletUserId(signedInUserId?: string | null): string {
  if (signedInUserId) return signedInUserId;
  if (typeof window === 'undefined') return 'guest';
  let guestId = localStorage.getItem('rvchain_wallet_guest');
  if (!guestId) {
    guestId = `guest-${Date.now()}`;
    localStorage.setItem('rvchain_wallet_guest', guestId);
  }
  return guestId;
}