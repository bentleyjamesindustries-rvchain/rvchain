import { FREE_AI_MESSAGES_PER_DAY } from './trailheadAi';
import { isModerator } from './moderator';

const KEY = 'rvchain_trailhead_usage_v1';

type DayUsage = { day: string; count: number };

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(userKey: string): DayUsage {
  if (typeof window === 'undefined') return { day: todayKey(), count: 0 };
  try {
    const raw = localStorage.getItem(`${KEY}_${userKey}`);
    if (!raw) return { day: todayKey(), count: 0 };
    const parsed = JSON.parse(raw) as DayUsage;
    if (parsed.day !== todayKey()) return { day: todayKey(), count: 0 };
    return parsed;
  } catch {
    return { day: todayKey(), count: 0 };
  }
}

function write(userKey: string, usage: DayUsage) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${KEY}_${userKey}`, JSON.stringify(usage));
}

export function getAiUserKey(userId?: string | null): string {
  return userId || 'guest';
}

export function getAiUsageToday(userId?: string | null): {
  used: number;
  limit: number;
  remaining: number;
} {
  const u = read(getAiUserKey(userId));
  return {
    used: u.count,
    limit: FREE_AI_MESSAGES_PER_DAY,
    remaining: Math.max(0, FREE_AI_MESSAGES_PER_DAY - u.count),
  };
}

export function incrementAiUsage(userId?: string | null): number {
  const key = getAiUserKey(userId);
  const u = read(key);
  const next = { day: todayKey(), count: u.count + 1 };
  write(key, next);
  return next.count;
}

/** Client-side free tier gate. Pro users skip via server flag. */
export function canSendFreeMessage(userId?: string | null): boolean {
  return getAiUsageToday(userId).remaining > 0;
}

export function hasClientAiPro(user: { email?: string } | null, profileAiPro?: boolean): boolean {
  if (profileAiPro) return true;
  if (isModerator(user)) return true;
  return false;
}
