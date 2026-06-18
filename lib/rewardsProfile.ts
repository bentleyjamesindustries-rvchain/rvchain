import { createEmptyProfile, RewardsProfile as MileageProfile } from './rewards';
import { createEmptyBookingState, BookingProgramState } from './bookingRewards';
import type { RewardProgramId } from './rewardPrograms';

export interface UnifiedRewardsData {
  activeProgram: RewardProgramId;
  mileage: MileageProfile;
  booking: BookingProgramState;
}

export function createEmptyUnifiedRewards(): UnifiedRewardsData {
  return {
    activeProgram: 'mileage',
    mileage: createEmptyProfile(),
    booking: createEmptyBookingState(),
  };
}

/** Migrate legacy flat mileage-only profile. */
export function migrateRewardsData(raw: unknown): UnifiedRewardsData {
  const base = createEmptyUnifiedRewards();
  if (!raw || typeof raw !== 'object') return base;

  const data = raw as Record<string, unknown>;

  if ('mileage' in data && 'booking' in data) {
    return {
      activeProgram: (data.activeProgram as RewardProgramId) || 'mileage',
      mileage: { ...base.mileage, ...(data.mileage as object) },
      booking: { ...base.booking, ...(data.booking as object) },
    };
  }

  return {
    activeProgram: (data.activeProgram as RewardProgramId) || 'mileage',
    mileage: { ...base.mileage, ...data } as MileageProfile,
    booking: base.booking,
  };
}

export function getActivePoints(data: UnifiedRewardsData): number {
  return data.activeProgram === 'booking' ? data.booking.totalPoints : data.mileage.totalPoints;
}