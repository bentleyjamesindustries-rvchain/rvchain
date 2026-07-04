import { supabase } from './supabaseClient';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!url || !key) return false;
  if (url.includes('your-project-ref')) return false;
  if (key.includes('your-anon-public-key')) return false;
  return true;
}

export function explainAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password. If you just signed up, confirm your email first.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirm your email before signing in. Use “Resend confirmation” below.';
  }
  if (lower.includes('user already registered')) {
    return 'An account with this email already exists. Sign in instead.';
  }
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 6 characters.';
  }
  if (lower.includes('unable to validate email')) {
    return 'Enter a valid email address.';
  }
  if (lower.includes('signup is disabled') || lower.includes('signups not allowed')) {
    return 'New sign-ups are disabled in Supabase. Enable Email provider in Authentication settings.';
  }
  if (lower.includes('fetch') || lower.includes('network')) {
    return 'Could not reach Supabase. Check your internet connection and API keys in .env.local.';
  }
  return message;
}

function siteOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export async function signUpWithEmail(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  return supabase.auth.signUp({
    email: normalized,
    password,
    options: {
      data: { username: normalized.split('@')[0] },
      emailRedirectTo: siteOrigin(),
    },
  });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
}

export async function resendSignupConfirmation(email: string) {
  return supabase.auth.resend({
    type: 'signup',
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: siteOrigin() },
  });
}