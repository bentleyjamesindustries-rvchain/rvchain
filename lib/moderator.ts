export function isModerator(user: { email?: string; username?: string } | null): boolean {
  if (!user?.email) return false;

  const list = process.env.NEXT_PUBLIC_MODERATOR_EMAILS ?? '';
  const allowed = list
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // Production: only listed emails. Empty list = no client-side admin UI.
  if (allowed.length === 0) return false;

  return allowed.includes(user.email.toLowerCase());
}