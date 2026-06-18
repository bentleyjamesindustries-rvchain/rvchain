import { supabase } from './supabaseClient';

/** Returns false when Supabase tables have not been created yet (PGRST205). */
export async function checkSupabaseTables(): Promise<boolean> {
  const { error } = await supabase.from('trips').select('id').limit(1);
  if (!error) return true;
  if (error.code === 'PGRST205') return false;
  // Table exists but query failed for another reason (e.g. RLS) — treat as ready.
  return true;
}

export function isMissingTableError(error: { code?: string } | null): boolean {
  return error?.code === 'PGRST205';
}