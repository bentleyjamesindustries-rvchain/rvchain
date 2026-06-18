'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Gift, Navigation, MapPin, Trophy, Fuel, Flame, Bitcoin,
  Play, Square, ChevronRight, Star, Shield, Zap, CalendarCheck, BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { Park } from '@/lib/parks';
import {
  REWARD_TIERS,
  REWARD_CATALOG,
  BOONDOCKING_SPOTS,
  getTierForMiles,
  getNextTier,
  addMileagePoints,
  performCheckIn,
  redeemReward,
  findNearbyCheckInTargets,
  formatPoints,
  RewardItem,
} from '@/lib/rewards';
import {
  BOOKING_TIERS,
  BOOKING_CHECKIN_BASE,
  BOOKING_NIGHT_BONUS,
  getBookingTier,
  getNextBookingTier,
  performBookingCheckIn,
  redeemBookingReward,
  findCheckInReadyBookings,
  getPendingBookings,
} from '@/lib/bookingRewards';
import { getProgramInfo } from '@/lib/rewardPrograms';
import {
  loadUnifiedRewards,
  saveUnifiedRewards,
  getRewardsUserId,
  getActivePoints,
} from '@/lib/rewardsStorage';
import type { UnifiedRewardsData } from '@/lib/rewardsProfile';
import type { RewardProgramId } from '@/lib/rewardPrograms';
import { loadWalletProfile } from '@/lib/walletStorage';
import { truncateAddress } from '@/lib/bitcoinAddress';
import { useMileageTracker } from '@/lib/useMileageTracker';
import ProgramSelector from './ProgramSelector';

interface RewardsPanelProps {
  user: { id: string; username?: string } | null;
  parks: Park[];
  userLocation: { lat: number; lng: number } | null;
  onRequestSignIn: () => void;
  onPointsChange?: (points: number) => void;
  onOpenWallet?: () => void;
  onBookPark?: (park: Park) => void;
}

type RewardCategory = 'all' | 'fuel' | 'propane' | 'gear' | 'crypto';

const CATEGORY_LABELS: Record<RewardCategory, string> = {
  all: 'All Rewards',
  fuel: 'Fuel Cards',
  propane: 'Propane',
  gear: 'Camping Gear',
  crypto: 'Bitcoin (Optional)',
};

const BOOKING_TIER_CHECKINS_LOOKUP = {
  scout: 0,
  explorer: 3,
  navigator: 10,
  legend: 25,
} as const;

export default function RewardsPanel({
  user,
  parks,
  userLocation,
  onRequestSignIn,
  onPointsChange,
  onOpenWallet,
  onBookPark,
}: RewardsPanelProps) {
  const userId = getRewardsUserId(user?.id);
  const [rewards, setRewards] = useState<UnifiedRewardsData>(() => loadUnifiedRewards(userId));
  const [rewardCategory, setRewardCategory] = useState<RewardCategory>('all');
  const [showCrypto, setShowCrypto] = useState(false);

  const program = rewards.activeProgram;
  const programInfo = getProgramInfo(program);
  const mileage = rewards.mileage;
  const booking = rewards.booking;
  const activePoints = program === 'booking' ? booking.totalPoints : mileage.totalPoints;

  const persist = useCallback(
    (next: UnifiedRewardsData) => {
      setRewards(next);
      saveUnifiedRewards(userId, next);
      onPointsChange?.(getActivePoints(next));
    },
    [userId, onPointsChange]
  );

  useEffect(() => {
    const loaded = loadUnifiedRewards(userId);
    setRewards(loaded);
    onPointsChange?.(getActivePoints(loaded));
  }, [userId, onPointsChange]);

  const handleProgramChange = (id: RewardProgramId) => {
    const next = { ...rewards, activeProgram: id };
    persist(next);
    toast.success(`Switched to ${getProgramInfo(id).name}`);
  };

  const handleMilesTick = useCallback(
    (miles: number) => {
      if (rewards.activeProgram !== 'mileage') return;
      setRewards((current) => {
        const next = {
          ...current,
          mileage: addMileagePoints(current.mileage, miles),
        };
        saveUnifiedRewards(userId, next);
        onPointsChange?.(getActivePoints(next));
        return next;
      });
    },
    [userId, onPointsChange, rewards.activeProgram]
  );

  const { isTracking, sessionMiles, lastUpdate, gpsError, startTracking, stopTracking, resetSession } =
    useMileageTracker(handleMilesTick);

  const mileageTier = getTierForMiles(mileage.totalMiles);
  const mileageNextTier = getNextTier(mileageTier);
  const mileageProgress = mileageNextTier
    ? ((mileage.totalMiles - mileageTier.minMiles) / (mileageNextTier.minMiles - mileageTier.minMiles)) * 100
    : 100;

  const bookingTier = getBookingTier(booking.checkInCount);
  const bookingNextTier = getNextBookingTier(bookingTier);
  const bookingProgress = bookingNextTier
    ? ((booking.checkInCount - bookingTier.minCheckIns) / (bookingNextTier.minCheckIns - bookingTier.minCheckIns)) * 100
    : 100;

  const nearby = useMemo(() => {
    if (!userLocation) return { campsites: [] as Park[], boondocking: [] };
    return findNearbyCheckInTargets(userLocation.lat, userLocation.lng, parks);
  }, [userLocation, parks]);

  const readyBookings = useMemo(() => {
    if (!userLocation) return [];
    return findCheckInReadyBookings(booking, parks, userLocation.lat, userLocation.lng);
  }, [booking, parks, userLocation]);

  const pendingBookings = useMemo(() => getPendingBookings(booking), [booking]);

  const filteredRewards = useMemo(() => {
    let items = REWARD_CATALOG;
    if (!showCrypto) items = items.filter((r) => r.category !== 'crypto');
    if (rewardCategory !== 'all') items = items.filter((r) => r.category === rewardCategory);
    return items;
  }, [rewardCategory, showCrypto]);

  const handleMileageCheckIn = (type: 'campsite' | 'boondocking', id: string, name: string) => {
    const { profile: next, points, error } = performCheckIn(mileage, type, id, name);
    if (error) return toast.error(error);
    persist({ ...rewards, mileage: next });
    toast.success(`+${points} points! Checked in at ${name}`);
  };

  const handleBookingCheckIn = (bookingId: string) => {
    const b = booking.bookings.find((x) => x.id === bookingId);
    if (!b) return;
    const park = parks.find((p) => p.id === b.parkId);
    const { state: next, points, error } = performBookingCheckIn(
      booking,
      b,
      userLocation?.lat,
      userLocation?.lng,
      park?.lat,
      park?.lng
    );
    if (error) return toast.error(error);
    persist({ ...rewards, booking: next });
    toast.success(`+${points} points! Stay check-in at ${b.parkName}`);
  };

  const handleRedeem = (reward: RewardItem) => {
    if (reward.category === 'crypto') {
      const wallet = loadWalletProfile(userId);
      if (!wallet) {
        toast.error('Set up My Wallet first to receive Bitcoin rewards.');
        onOpenWallet?.();
        return;
      }
    }

    if (program === 'booking') {
      const { state: next, success, error } = redeemBookingReward(booking, reward);
      if (!success) return toast.error(error);
      persist({ ...rewards, booking: next });
    } else {
      const { profile: next, success, error } = redeemReward(mileage, reward);
      if (!success) return toast.error(error);
      persist({ ...rewards, mileage: next });
    }

    if (reward.category === 'crypto') {
      const wallet = loadWalletProfile(userId)!;
      toast.success(`${reward.name} queued to ${truncateAddress(wallet.bitcoinAddress)}`);
    } else {
      toast.success(`${reward.name} redeemed! Check your email for delivery.`);
    }
  };

  const handleStopDrive = () => {
    stopTracking();
    if (sessionMiles > 0) toast.success(`Drive logged: ${sessionMiles.toFixed(1)} miles this session`);
    resetSession();
  };

  const activityLog = program === 'booking' ? booking.activityLog : mileage.activityLog;

  return (
    <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Program picker */}
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-5">
        <h3 className="font-semibold text-sm text-slate-300 mb-1">Choose Your Rewards Program</h3>
        <p className="text-xs text-slate-500 mb-3">Pick one — switch anytime. Points are tracked separately per program.</p>
        <ProgramSelector active={program} onSelect={handleProgramChange} />
      </div>

      {/* Hero */}
      <div className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 ${
        program === 'mileage'
          ? 'border-amber-700/40 bg-gradient-to-br from-amber-950/60 via-slate-900 to-green-950/40'
          : 'border-sky-700/40 bg-gradient-to-br from-sky-950/60 via-slate-900 to-slate-900'
      }`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className={`flex items-center gap-2 text-sm font-medium mb-1 ${programInfo.accent}`}>
              <Trophy className="w-4 h-4" />
              {programInfo.name}
            </div>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight">{programInfo.tagline}</h2>
            <p className="text-slate-400 mt-2 max-w-lg text-sm sm:text-base">{programInfo.description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-bold text-amber-300">{formatPoints(activePoints)}</div>
            <div className="text-sm text-slate-400">points available</div>
          </div>
        </div>

        {program === 'mileage' ? (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border font-semibold text-sm"
              style={{ borderColor: mileageTier.color, color: mileageTier.color, backgroundColor: `${mileageTier.color}15` }}>
              <Star className="w-4 h-4" />
              {mileageTier.name}
              <span className="text-xs opacity-70">({mileageTier.multiplier}×)</span>
            </div>
            <div className="text-sm text-slate-400">
              {mileage.totalMiles.toFixed(0)} mi · {mileage.checkInCount} check-ins
            </div>
            {mileageNextTier && (
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>→ {mileageNextTier.name}</span>
                  <span>{(mileageNextTier.minMiles - mileage.totalMiles).toFixed(0)} mi</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, mileageProgress)}%`, backgroundColor: mileageNextTier.color }} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border font-semibold text-sm"
              style={{ borderColor: bookingTier.color, color: bookingTier.color, backgroundColor: `${bookingTier.color}15` }}>
              <Star className="w-4 h-4" />
              {bookingTier.name}
              <span className="text-xs opacity-70">({bookingTier.multiplier}×)</span>
            </div>
            <div className="text-sm text-slate-400">
              {booking.checkInCount} stay check-ins · {pendingBookings.length} upcoming booking{pendingBookings.length !== 1 ? 's' : ''}
            </div>
            {bookingNextTier && (
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>→ {bookingNextTier.name}</span>
                  <span>{bookingNextTier.minCheckIns - booking.checkInCount} check-ins</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, bookingProgress)}%`, backgroundColor: bookingNextTier.color }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!user && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-700 bg-slate-900/50">
          <p className="text-sm text-slate-400">Sign in to sync rewards across devices.</p>
          <button onClick={onRequestSignIn} className="shrink-0 bg-white text-black px-5 py-2 rounded-3xl text-sm font-semibold">Sign In</button>
        </div>
      )}

      {program === 'mileage' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Navigation className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-lg">Mileage Tracker</h3>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-4">
              <div className="text-4xl font-bold text-emerald-300">{sessionMiles.toFixed(1)}</div>
              <div className="text-sm text-slate-400">miles this session</div>
            </div>
            {gpsError && <div className="text-sm text-amber-400 bg-amber-950/30 border border-amber-800/50 rounded-xl p-3 mb-4">{gpsError}</div>}
            <div className="flex gap-2">
              {!isTracking ? (
                <button onClick={startTracking} className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 h-12 rounded-3xl font-semibold">
                  <Play className="w-4 h-4" /> Start Tracking
                </button>
              ) : (
                <button onClick={handleStopDrive} className="flex-1 flex items-center justify-center gap-2 bg-red-800/80 hover:bg-red-700 h-12 rounded-3xl font-semibold">
                  <Square className="w-4 h-4" /> Stop &amp; Save
                </button>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-lg">Location Check-In</h3>
            </div>
            {!userLocation ? (
              <p className="text-center py-8 text-slate-400 text-sm">Use &quot;Use My Location&quot; on the home screen first.</p>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto">
                {nearby.campsites.map((park) => (
                  <button key={park.id} onClick={() => handleMileageCheckIn('campsite', park.id, park.name)}
                    className="w-full flex items-center justify-between p-3 bg-slate-950 border border-slate-800 hover:border-emerald-700 rounded-2xl text-left">
                    <div><div className="font-medium text-sm">{park.name}</div><div className="text-xs text-slate-400">+250 pts</div></div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-sky-400" />
              <h3 className="font-semibold text-lg">Book on rvchain</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Open any park → <strong className="text-sky-300">Book on rvchain</strong> to reserve. Earn {BOOKING_CHECKIN_BASE}+ pts when you check in on arrival (+{BOOKING_NIGHT_BONUS}/night).
            </p>
            <button
              onClick={() => onBookPark?.(parks[0])}
              className="w-full bg-sky-800 hover:bg-sky-700 h-11 rounded-2xl text-sm font-semibold mb-4"
            >
              Find a Park to Book
            </button>
            <div className="text-xs font-medium text-slate-400 mb-2">Your bookings ({booking.bookings.length})</div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {booking.bookings.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No bookings yet</p>
              ) : (
                booking.bookings.slice(0, 8).map((b) => (
                  <div key={b.id} className={`p-3 rounded-2xl border text-sm ${b.checkedIn ? 'border-emerald-800/50 bg-emerald-950/20' : 'border-slate-800 bg-slate-950'}`}>
                    <div className="font-medium">{b.parkName}</div>
                    <div className="text-xs text-slate-400">{b.checkInDate} → {b.checkOutDate} · {b.nights} nights</div>
                    <div className={`text-[10px] mt-1 ${b.checkedIn ? 'text-emerald-400' : 'text-sky-400'}`}>
                      {b.checkedIn ? '✓ Checked in — points earned' : 'Awaiting arrival check-in'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarCheck className="w-5 h-5 text-sky-400" />
              <h3 className="font-semibold text-lg">Stay Check-In</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">Only for parks you booked through rvchain. Must be on-site (within 5 mi).</p>
            {!userLocation ? (
              <p className="text-center py-8 text-slate-400 text-sm">Enable location to check in at your booked park.</p>
            ) : readyBookings.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">
                {pendingBookings.length > 0
                  ? 'No booked parks nearby yet — drive closer to check in.'
                  : 'Book a park on rvchain, then check in on arrival day.'}
              </p>
            ) : (
              <div className="space-y-2">
                {readyBookings.map(({ booking: b, distance }) => (
                  <button key={b.id} onClick={() => handleBookingCheckIn(b.id)}
                    className="w-full flex items-center justify-between p-3 bg-slate-950 border border-sky-800/50 hover:border-sky-600 rounded-2xl text-left">
                    <div>
                      <div className="font-medium text-sm">{b.parkName}</div>
                      <div className="text-xs text-slate-400">{b.nights} nights · {distance.toFixed(1)} mi away</div>
                    </div>
                    <span className="text-xs font-semibold text-sky-300">Check In</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tiers */}
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-sky-400" />
          <h3 className="font-semibold text-lg">{program === 'booking' ? 'Stay Tiers' : 'Mileage Tiers'}</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(program === 'booking' ? BOOKING_TIERS : REWARD_TIERS).map((t) => {
            const active = program === 'booking'
              ? (t as typeof BOOKING_TIERS[0]).id === bookingTier.id
              : (t as typeof REWARD_TIERS[0]).id === mileageTier.id;
            const unlocked = program === 'booking'
              ? booking.checkInCount >= (t as typeof BOOKING_TIERS[0]).minCheckIns
              : mileage.totalMiles >= (t as typeof REWARD_TIERS[0]).minMiles;
            return (
              <div key={t.id} className={`p-3 sm:p-4 rounded-2xl border ${active ? 'border-2' : 'border-slate-800'}`}
                style={active ? { borderColor: t.color } : undefined}>
                <div className="font-semibold text-sm" style={{ color: unlocked ? t.color : '#64748b' }}>{t.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {program === 'booking'
                    ? `${(t as typeof BOOKING_TIERS[0]).minCheckIns}+ stays`
                    : `${(t as typeof REWARD_TIERS[0]).minMiles.toLocaleString()}+ mi`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Catalog */}
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-lg">Redeem Rewards</h3>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input type="checkbox" checked={showCrypto} onChange={(e) => setShowCrypto(e.target.checked)} className="rounded" />
            Show Bitcoin (optional)
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredRewards.map((reward) => {
            const canAfford = activePoints >= reward.pointsCost;
            const hasTier = program === 'booking'
              ? booking.checkInCount >= BOOKING_TIER_CHECKINS_LOOKUP[reward.tierRequired]
              : mileage.totalMiles >= (REWARD_TIERS.find((t) => t.id === reward.tierRequired)?.minMiles ?? 0);
            return (
              <div key={reward.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex flex-col">
                <div className="text-2xl mb-1">{reward.icon}</div>
                <div className="font-semibold text-sm">{reward.name}</div>
                <div className="text-xs text-slate-400 flex-1 mt-0.5">{reward.description}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-amber-300 font-bold text-sm">{formatPoints(reward.pointsCost)} pts</span>
                  <button onClick={() => handleRedeem(reward)} disabled={!canAfford || !hasTier}
                    className="text-xs px-3 py-1.5 rounded-xl font-semibold bg-green-700 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed">
                    Redeem
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activityLog.length > 0 && (
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold">Recent Activity</h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activityLog.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-800 last:border-0">
                <span className="text-slate-300 text-xs sm:text-sm">{entry.description}</span>
                <span className={entry.points >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                  {entry.points >= 0 ? '+' : ''}{formatPoints(entry.points)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}