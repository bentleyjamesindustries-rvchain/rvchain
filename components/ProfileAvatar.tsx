'use client';

import { getProfileInitials } from '@/lib/userProfile';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-14 h-14 text-sm',
  xl: 'w-20 h-20 text-lg',
};

interface ProfileAvatarProps {
  handle: string;
  avatarUrl?: string | null;
  size?: AvatarSize;
  className?: string;
}

export default function ProfileAvatar({
  handle,
  avatarUrl,
  size = 'md',
  className = '',
}: ProfileAvatarProps) {
  const sizeClass = SIZE_CLASSES[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`rounded-full object-cover shrink-0 ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center font-bold text-white shrink-0 ${sizeClass} ${className}`}
      aria-hidden
    >
      {getProfileInitials(handle)}
    </div>
  );
}