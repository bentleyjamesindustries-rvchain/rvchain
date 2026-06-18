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

export async function sendRecoveryCode(channel: RecoveryChannel, contact: string) {
  if (channel === 'email') {
    const email = contact.trim().toLowerCase();
    return supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
  }

  const phone = normalizePhone(contact);
  return supabase.auth.signInWithOtp({ phone });
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