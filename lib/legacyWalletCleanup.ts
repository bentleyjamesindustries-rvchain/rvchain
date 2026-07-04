/** Remove leftover Bitcoin wallet keys from older app versions. */
const LEGACY_PREFIXES = ['rvchain_wallet', 'rvchain_wallet_invite'] as const;

export function purgeLegacyWalletStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (LEGACY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore private browsing / quota errors.
  }
}