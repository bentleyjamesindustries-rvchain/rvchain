'use client';

interface VerifiedBadgeProps {
  verifiedBy?: string;
  verifiedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'text-[9px] px-2 py-0.5',
  md: 'text-[10px] px-2.5 py-1',
  lg: 'text-xs px-3 py-1.5',
};

export default function VerifiedBadge({
  verifiedBy,
  verifiedAt,
  size = 'md',
  className = '',
}: VerifiedBadgeProps) {
  const title = verifiedBy
    ? `Verified by ${verifiedBy}${verifiedAt ? ` on ${new Date(verifiedAt).toLocaleDateString()}` : ''}`
    : 'Verified by rvchain moderators';

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 font-semibold text-emerald-200 bg-emerald-950/70 border border-emerald-600/50 rounded-full ${SIZES[size]} ${className}`}
    >
      <span aria-hidden>✓</span>
      Verified
    </span>
  );
}