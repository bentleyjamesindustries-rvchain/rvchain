export type ExplorerAgeBand = 'under-8' | '8-12' | '13+' | 'unspecified';

export interface ExplorerProfile {
  id: string;
  nickname: string;
  pinHash: string;
  avatarUrl: string | null;
  ageBand: ExplorerAgeBand;
  frozen: boolean;
  createdAt: string;
}

export interface FamilyAccount {
  parentUserId: string;
  familyCode: string;
  parentPhone: string | null;
  phoneVerified: boolean;
  phoneVerifiedAt: string | null;
  explorers: ExplorerProfile[];
  updatedAt: string;
}

export interface ActiveExplorerSession {
  parentUserId: string;
  familyCode: string;
  explorerId: string;
  nickname: string;
  signedInAt: string;
}

export const MAX_EXPLORERS = 4;
export const PIN_MIN_LEN = 4;
export const PIN_MAX_LEN = 6;

const FAMILY_KEY = 'rvchain_family_accounts';
const CODE_INDEX_KEY = 'rvchain_family_code_index';
const SESSION_KEY = 'rvchain_active_explorer';
const FAIL_KEY = 'rvchain_explorer_pin_fails';

function loadAllFamilies(): Record<string, FamilyAccount> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(FAMILY_KEY);
    return raw ? (JSON.parse(raw) as Record<string, FamilyAccount>) : {};
  } catch {
    return {};
  }
}

function saveAllFamilies(all: Record<string, FamilyAccount>) {
  localStorage.setItem(FAMILY_KEY, JSON.stringify(all));
}

function loadCodeIndex(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CODE_INDEX_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveCodeIndex(index: Record<string, string>) {
  localStorage.setItem(CODE_INDEX_KEY, JSON.stringify(index));
}

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let body = '';
  for (let i = 0; i < 4; i++) {
    body += chars[Math.floor(Math.random() * chars.length)];
  }
  return `RV-${body}`;
}

export async function hashPin(pin: string, familyCode: string): Promise<string> {
  const data = new TextEncoder().encode(`${familyCode.toUpperCase()}:${pin}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

export function normalizeFamilyCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

export function normalizeNickname(name: string): string {
  return name.trim().slice(0, 20);
}

export function getFamilyAccount(parentUserId: string): FamilyAccount | null {
  return loadAllFamilies()[parentUserId] ?? null;
}

export function ensureFamilyAccount(parentUserId: string): FamilyAccount {
  const all = loadAllFamilies();
  const existing = all[parentUserId];
  if (existing) return existing;

  let familyCode = randomCode();
  const index = loadCodeIndex();
  while (index[familyCode]) {
    familyCode = randomCode();
  }

  const account: FamilyAccount = {
    parentUserId,
    familyCode,
    parentPhone: null,
    phoneVerified: false,
    phoneVerifiedAt: null,
    explorers: [],
    updatedAt: new Date().toISOString(),
  };
  all[parentUserId] = account;
  saveAllFamilies(all);
  index[familyCode] = parentUserId;
  saveCodeIndex(index);
  return account;
}

function saveFamily(account: FamilyAccount): FamilyAccount {
  const next = { ...account, updatedAt: new Date().toISOString() };
  const all = loadAllFamilies();
  all[account.parentUserId] = next;
  saveAllFamilies(all);
  return next;
}

export function findFamilyByCode(familyCode: string): FamilyAccount | null {
  const code = normalizeFamilyCode(familyCode);
  const index = loadCodeIndex();
  const parentId = index[code];
  if (!parentId) {
    // Rebuild index from accounts if needed
    const all = loadAllFamilies();
    for (const acc of Object.values(all)) {
      if (acc.familyCode === code) return acc;
    }
    return null;
  }
  return getFamilyAccount(parentId);
}

export function setParentPhone(
  parentUserId: string,
  phone: string
): FamilyAccount {
  const account = ensureFamilyAccount(parentUserId);
  return saveFamily({
    ...account,
    parentPhone: phone.trim(),
    phoneVerified: false,
    phoneVerifiedAt: null,
  });
}

export function markPhoneVerified(parentUserId: string, phone: string): FamilyAccount {
  const account = ensureFamilyAccount(parentUserId);
  return saveFamily({
    ...account,
    parentPhone: phone.trim(),
    phoneVerified: true,
    phoneVerifiedAt: new Date().toISOString(),
  });
}

export async function addExplorer(
  parentUserId: string,
  input: {
    nickname: string;
    pin: string;
    ageBand?: ExplorerAgeBand;
    avatarUrl?: string | null;
  }
): Promise<{ account: FamilyAccount; explorer: ExplorerProfile } | { error: string }> {
  const account = ensureFamilyAccount(parentUserId);
  if (!account.phoneVerified) {
    return { error: 'Verify your parent phone number before adding explorers.' };
  }
  if (account.explorers.length >= MAX_EXPLORERS) {
    return { error: `Maximum ${MAX_EXPLORERS} explorers per family.` };
  }
  const nickname = normalizeNickname(input.nickname);
  if (nickname.length < 2) return { error: 'Nickname must be at least 2 characters.' };
  if (!isValidPin(input.pin)) return { error: 'PIN must be 4–6 digits.' };
  if (account.explorers.some((e) => e.nickname.toLowerCase() === nickname.toLowerCase())) {
    return { error: 'That nickname is already used in this family.' };
  }

  const explorer: ExplorerProfile = {
    id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nickname,
    pinHash: await hashPin(input.pin, account.familyCode),
    avatarUrl: input.avatarUrl ?? null,
    ageBand: input.ageBand ?? 'unspecified',
    frozen: false,
    createdAt: new Date().toISOString(),
  };

  const next = saveFamily({
    ...account,
    explorers: [...account.explorers, explorer],
  });
  return { account: next, explorer };
}

export async function resetExplorerPin(
  parentUserId: string,
  explorerId: string,
  newPin: string
): Promise<{ account: FamilyAccount } | { error: string }> {
  if (!isValidPin(newPin)) return { error: 'PIN must be 4–6 digits.' };
  const account = ensureFamilyAccount(parentUserId);
  const pinHash = await hashPin(newPin, account.familyCode);
  const explorers = account.explorers.map((e) =>
    e.id === explorerId ? { ...e, pinHash } : e
  );
  if (!explorers.some((e) => e.id === explorerId)) return { error: 'Explorer not found.' };
  return { account: saveFamily({ ...account, explorers }) };
}

export function setExplorerFrozen(
  parentUserId: string,
  explorerId: string,
  frozen: boolean
): FamilyAccount | null {
  const account = getFamilyAccount(parentUserId);
  if (!account) return null;
  return saveFamily({
    ...account,
    explorers: account.explorers.map((e) =>
      e.id === explorerId ? { ...e, frozen } : e
    ),
  });
}

export function removeExplorer(parentUserId: string, explorerId: string): FamilyAccount | null {
  const account = getFamilyAccount(parentUserId);
  if (!account) return null;
  return saveFamily({
    ...account,
    explorers: account.explorers.filter((e) => e.id !== explorerId),
  });
}

function getFailState(): { count: number; lockedUntil: number } {
  try {
    const raw = localStorage.getItem(FAIL_KEY);
    if (!raw) return { count: 0, lockedUntil: 0 };
    return JSON.parse(raw) as { count: number; lockedUntil: number };
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
}

function setFailState(state: { count: number; lockedUntil: number }) {
  localStorage.setItem(FAIL_KEY, JSON.stringify(state));
}

export async function signInExplorer(
  familyCode: string,
  nickname: string,
  pin: string
): Promise<{ session: ActiveExplorerSession } | { error: string }> {
  const fails = getFailState();
  if (fails.lockedUntil > Date.now()) {
    const secs = Math.ceil((fails.lockedUntil - Date.now()) / 1000);
    return { error: `Too many attempts. Try again in ${secs}s.` };
  }

  const account = findFamilyByCode(familyCode);
  if (!account) {
    return { error: 'Family code not found. Ask a parent for the code from My Little Explorers.' };
  }

  const nick = normalizeNickname(nickname);
  const explorer = account.explorers.find(
    (e) => e.nickname.toLowerCase() === nick.toLowerCase()
  );
  if (!explorer) return { error: 'No explorer with that nickname in this family.' };
  if (explorer.frozen) {
    return { error: 'This explorer is frozen. Ask a parent to unlock it.' };
  }

  const pinHash = await hashPin(pin, account.familyCode);
  if (pinHash !== explorer.pinHash) {
    const nextCount = fails.count + 1;
    const lockedUntil = nextCount >= 5 ? Date.now() + 60_000 : 0;
    setFailState({ count: nextCount >= 5 ? 0 : nextCount, lockedUntil: lockedUntil || fails.lockedUntil });
    if (lockedUntil) return { error: 'Too many wrong PINs. Locked for 60 seconds.' };
    return { error: 'Incorrect PIN.' };
  }

  setFailState({ count: 0, lockedUntil: 0 });
  const session: ActiveExplorerSession = {
    parentUserId: account.parentUserId,
    familyCode: account.familyCode,
    explorerId: explorer.id,
    nickname: explorer.nickname,
    signedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { session };
}

export function getActiveExplorerSession(): ActiveExplorerSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveExplorerSession;
  } catch {
    return null;
  }
}

export function clearExplorerSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

/** Storage key for kids progress: per-explorer when signed in as kid. */
export function getKidsProgressUserId(
  explorerSession: ActiveExplorerSession | null,
  signedInUserId?: string | null
): string {
  if (explorerSession) return `explorer:${explorerSession.explorerId}`;
  if (signedInUserId) return signedInUserId;
  return 'guest';
}

export function formatPhoneDisplay(phone: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function normalizePhoneInput(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (input.trim().startsWith('+') && digits.length >= 10) return `+${digits}`;
  return null;
}
