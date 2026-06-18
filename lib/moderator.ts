export function isModerator(user: { email?: string; username?: string } | null): boolean {
  if (!user?.email) return false;

  const list = process.env.NEXT_PUBLIC_MODERATOR_EMAILS ?? '';
  const allowed = list
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (allowed.length === 0) {
    // MVP: any signed-in user can verify when no moderator list is configured
    return true;
  }

  return allowed.includes(user.email.toLowerCase());
}