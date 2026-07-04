import { Park, calculateDistance } from './parks';
import { CHECKIN_RADIUS_MILES } from './rewards';
import {
  applyMembershipCheckInBonus,
  getMembershipPlan,
  type MembershipPlanId,
} from './membershipPlans';
import type { ActivityEntry, RedemptionRecord, RewardItem, RewardTierId } from './rewards';
import type { BookingPayment } from './bookingPayments';

export type BookingTierId = 'weekender' | 'season' | 'regular' | 'fulltimer';

export interface BookingTier {
  id: BookingTierId;
  name: string;
  minCheckIns: number;
  multiplier: number;
  color: string;
  perk: string;
}

export interface SiteBooking {
  id: string;
  parkId: string;
  parkName: string;
  city: string | null;
  state: string | null;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  pricePerNight: number;
  bookedAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  payment?: BookingPayment;
  totalPaid?: number;
}

export interface BookingProgramState {
  totalPoints: number;
  checkInCount: number;
  bookings: SiteBooking[];
  lastCheckIns: Record<string, string>;
  activityLog: ActivityEntry[];
  redeemedRewards: RedemptionRecord[];
}

export const BOOKING_CHECKIN_BASE = 500;
export const BOOKING_NIGHT_BONUS = 75;
export const BOOKING_CHECKIN_COOLDOWN_HOURS = 24;

export const BOOKING_TIERS: BookingTier[] = [
  { id: 'weekender', name: 'Weekender', minCheckIns: 0, multiplier: 1, color: '#94a3b8', perk: '500 pts per stay check-in' },
  { id: 'season', name: 'Season Camper', minCheckIns: 3, multiplier: 1.25, color: '#4ade80', perk: '25% bonus on check-ins' },
  { id: 'regular', name: 'Road Regular', minCheckIns: 10, multiplier: 1.5, color: '#38bdf8', perk: 'Priority booking support' },
  { id: 'fulltimer', name: 'Full-Timer', minCheckIns: 25, multiplier: 2, color: '#fbbf24', perk: 'Exclusive partner discounts' },
];

const TIER_RANK: Record<BookingTierId, number> = {
  weekender: 0,
  season: 1,
  regular: 2,
  fulltimer: 3,
};

export function createEmptyBookingState(): BookingProgramState {
  return {
    totalPoints: 0,
    checkInCount: 0,
    bookings: [],
    lastCheckIns: {},
    activityLog: [],
    redeemedRewards: [],
  };
}

export function getBookingTier(checkIns: number): BookingTier {
  let tier = BOOKING_TIERS[0];
  for (const t of BOOKING_TIERS) {
    if (checkIns >= t.minCheckIns) tier = t;
  }
  return tier;
}

export function getNextBookingTier(current: BookingTier): BookingTier | null {
  const idx = BOOKING_TIERS.findIndex((t) => t.id === current.id);
  return idx < BOOKING_TIERS.length - 1 ? BOOKING_TIERS[idx + 1] : null;
}

function logBookingActivity(
  state: BookingProgramState,
  description: string,
  points: number
): ActivityEntry[] {
  const entry: ActivityEntry = {
    id: `bact-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'checkin',
    description,
    points,
    createdAt: new Date().toISOString(),
  };
  return [entry, ...state.activityLog].slice(0, 50);
}

export function createSiteBooking(
  park: Park,
  checkInDate: string,
  checkOutDate: string,
  payment?: BookingPayment
): SiteBooking {
  const inD = new Date(checkInDate);
  const outD = new Date(checkOutDate);
  const nights = Math.max(1, Math.round((outD.getTime() - inD.getTime()) / (1000 * 60 * 60 * 24)));
  const totalPaid = payment?.usdAmount ?? (park.price ?? 0) * nights;

  return {
    id: `book-${Date.now()}`,
    parkId: park.id,
    parkName: park.name,
    city: park.city,
    state: park.state,
    checkInDate,
    checkOutDate,
    nights,
    pricePerNight: park.price ?? 0,
    bookedAt: new Date().toISOString(),
    checkedIn: false,
    payment,
    totalPaid,
  };
}

export function addBooking(state: BookingProgramState, booking: SiteBooking): BookingProgramState {
  return {
    ...state,
    bookings: [booking, ...state.bookings],
    activityLog: logBookingActivity(
      state,
      `Booked ${booking.parkName} (${booking.nights} night${booking.nights > 1 ? 's' : ''}) on rvchain (demo)`,
      0
    ),
  };
}

export function getPendingBookings(state: BookingProgramState): SiteBooking[] {
  const today = new Date().toISOString().slice(0, 10);
  return state.bookings.filter((b) => !b.checkedIn && b.checkOutDate >= today);
}

export function getBookableCheckIn(
  state: BookingProgramState,
  parkId: string
): SiteBooking | undefined {
  const today = new Date().toISOString().slice(0, 10);
  return state.bookings.find(
    (b) =>
      b.parkId === parkId &&
      !b.checkedIn &&
      b.checkInDate <= today &&
      b.checkOutDate >= today
  );
}

export function canBookingCheckIn(state: BookingProgramState, bookingId: string): boolean {
  const last = state.lastCheckIns[bookingId];
  if (!last) return true;
  const hoursSince = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60);
  return hoursSince >= BOOKING_CHECKIN_COOLDOWN_HOURS;
}

export function performBookingCheckIn(
  state: BookingProgramState,
  booking: SiteBooking,
  userLat?: number,
  userLng?: number,
  parkLat?: number | null,
  parkLng?: number | null,
  membershipPlanId: MembershipPlanId = 'campfire'
): { state: BookingProgramState; points: number; error?: string } {
  if (booking.checkedIn) {
    return { state, points: 0, error: 'You already checked in for this booking.' };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (booking.checkInDate > today) {
    return { state, points: 0, error: `Check-in opens on ${booking.checkInDate}.` };
  }
  if (booking.checkOutDate < today) {
    return { state, points: 0, error: 'This booking has expired.' };
  }

  if (!canBookingCheckIn(state, booking.id)) {
    return { state, points: 0, error: 'Already checked in recently.' };
  }

  if (userLat != null && userLng != null && parkLat != null && parkLng != null) {
    const dist = calculateDistance(userLat, userLng, parkLat, parkLng);
    if (dist > CHECKIN_RADIUS_MILES) {
      return { state, points: 0, error: `You must be within ${CHECKIN_RADIUS_MILES} mi of the park to check in (${dist.toFixed(1)} mi away).` };
    }
  }

  const tier = getBookingTier(state.checkInCount);
  const base = BOOKING_CHECKIN_BASE + booking.nights * BOOKING_NIGHT_BONUS;
  const tierPoints = Math.round(base * tier.multiplier);
  const points = applyMembershipCheckInBonus(tierPoints, membershipPlanId);
  const memberPlan = getMembershipPlan(membershipPlanId);
  const memberNote =
    memberPlan.checkInBonusPercent > 0
      ? `, +${memberPlan.checkInBonusPercent}% ${memberPlan.name} member bonus`
      : '';

  const updatedBookings = state.bookings.map((b) =>
    b.id === booking.id ? { ...b, checkedIn: true, checkedInAt: new Date().toISOString() } : b
  );

  return {
    state: {
      ...state,
      totalPoints: state.totalPoints + points,
      checkInCount: state.checkInCount + 1,
      bookings: updatedBookings,
      lastCheckIns: { ...state.lastCheckIns, [booking.id]: new Date().toISOString() },
      activityLog: logBookingActivity(
        state,
        `Stay check-in at ${booking.parkName} (${booking.nights} nights, ${tier.name} tier${memberNote})`,
        points
      ),
    },
    points,
  };
}

export function findCheckInReadyBookings(
  state: BookingProgramState,
  parks: Park[],
  userLat: number,
  userLng: number
): { booking: SiteBooking; park: Park; distance: number }[] {
  const today = new Date().toISOString().slice(0, 10);
  const parkById = new Map(parks.map((p) => [p.id, p]));
  const results: { booking: SiteBooking; park: Park; distance: number }[] = [];

  for (const booking of state.bookings) {
    if (booking.checkedIn || booking.checkInDate > today || booking.checkOutDate < today) continue;
    const park = parkById.get(booking.parkId);
    if (!park || park.lat == null || park.lng == null) continue;
    const distance = calculateDistance(userLat, userLng, park.lat, park.lng);
    if (distance <= CHECKIN_RADIUS_MILES) {
      results.push({ booking, park, distance });
    }
  }

  return results.sort((a, b) => a.distance - b.distance);
}

export function bookingTierMeetsRequirement(
  userCheckIns: number,
  required: BookingTierId
): boolean {
  const userTier = getBookingTier(userCheckIns);
  return TIER_RANK[userTier.id] >= TIER_RANK[required];
}

const BOOKING_TIER_CHECKINS: Record<RewardTierId, number> = {
  scout: 0,
  explorer: 3,
  navigator: 10,
  legend: 25,
};

export function redeemBookingReward(
  state: BookingProgramState,
  reward: RewardItem
): { state: BookingProgramState; success: boolean; error?: string } {
  const required = BOOKING_TIER_CHECKINS[reward.tierRequired];
  if (state.checkInCount < required) {
    const tierName = BOOKING_TIERS.find((t) => t.minCheckIns === required)?.name ?? 'higher tier';
    return { state, success: false, error: `Requires ${tierName} (${required}+ stay check-ins)` };
  }

  if (state.totalPoints < reward.pointsCost) {
    return { state, success: false, error: `Need ${reward.pointsCost - state.totalPoints} more points` };
  }

  const redemption: RedemptionRecord = {
    id: `bred-${Date.now()}`,
    rewardId: reward.id,
    rewardName: reward.name,
    pointsSpent: reward.pointsCost,
    redeemedAt: new Date().toISOString(),
  };

  const entry: ActivityEntry = {
    id: `bact-${Date.now()}`,
    type: 'redemption',
    description: `Redeemed ${reward.name}`,
    points: -reward.pointsCost,
    createdAt: new Date().toISOString(),
  };

  return {
    state: {
      ...state,
      totalPoints: state.totalPoints - reward.pointsCost,
      redeemedRewards: [redemption, ...state.redeemedRewards],
      activityLog: [entry, ...state.activityLog].slice(0, 50),
    },
    success: true,
  };
}