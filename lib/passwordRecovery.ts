import { supabase } from './supabaseClient';

export type RecoveryChannel = 'email' | 'sms';

export function normalizePhone(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    return digits ? `+${digits}` : trimmed;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^\+\d{10,15}$/.test(normalized);
}

function getAuthRedirectUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rvchain.vercel.app';
}

export function explainRecoveryError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('signups not allowed')) {
    return 'No account exists for this email. Use the same email you signed up with, or create an account first.';
  }
  if (lower.includes('unsupported phone provider')) {
    return 'Text codes are not set up yet. Use email, or configure Twilio in Supabase → Authentication → Providers → Phone.';
  }
  if (lower.includes('rate limit')) {
    return 'Too many attempts. Wait a minute and try again.';
  }
  return message;
}

export async function sendRecoveryCode(channel: RecoveryChannel, contact: string) {
  if (channel === 'email') {
    const email = contact.trim().toLowerCase();
    // No emailRedirectTo — keeps delivery focused on OTP code (not magic link) when template uses {{ .Token }}
    return supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
  }

  const phone = normalizePhone(contact);
  return supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: false },
  });
}

/** Fallback when OTP is not configured — sends a password reset link email. */
export async function sendRecoveryEmailLink(email: string) {
  return supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: getAuthRedirectUrl(),
  });
}

export async function verifyRecoveryCode(
  channel: RecoveryChannel,
  contact: string,
  token: string
) {
  const code = token.trim();

  if (channel === 'email') {
    return supabase.auth.verifyOtp({
      email: contact.trim().toLowerCase(),
      token: code,
      type: 'email',
    });
  }

  return supabase.auth.verifyOtp({
    phone: normalizePhone(contact),
    token: code,
    type: 'sms',
  });
}

export async function updateUserPassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword });
}