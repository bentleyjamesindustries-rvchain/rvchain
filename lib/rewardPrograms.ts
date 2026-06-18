export type RewardProgramId = 'mileage' | 'booking';

export interface RewardProgramInfo {
  id: RewardProgramId;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  accent: string;
  borderAccent: string;
}

export const REWARD_PROGRAMS: RewardProgramInfo[] = [
  {
    id: 'mileage',
    name: 'RV Mileage Rewards',
    tagline: 'Drive. Check in. Earn.',
    description: 'Earn points for every mile you drive, plus bonuses for campsite and boondocking check-ins.',
    highlights: ['GPS mileage tracking', 'Any campsite check-in', 'Mileage-based tiers'],
    accent: 'text-emerald-400',
    borderAccent: 'border-emerald-700/60',
  },
  {
    id: 'booking',
    name: 'Book & Stay Rewards',
    tagline: 'Demo bookings. Check in. Earn.',
    description: 'Try the book-and-stay flow (demo only — saved locally). Earn points when you check in on arrival day.',
    highlights: ['Simulate campsite bookings', 'Check in on arrival day', 'Bigger points per stay'],
    accent: 'text-sky-400',
    borderAccent: 'border-sky-700/60',
  },
];

export function getProgramInfo(id: RewardProgramId): RewardProgramInfo {
  return REWARD_PROGRAMS.find((p) => p.id === id) ?? REWARD_PROGRAMS[0];
}