'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Gift, Navigation, MapPin, Trophy,
  Play, Square, ChevronRight, Star, Shield, Zap, LogIn, Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Park } from '@/lib/parks';
import {
  REWARD_TIERS,
  REWARD_CATALOG,
  getTierForMiles,
  getNextTier,
  addMileagePoints,
  performCheckIn,
  redeemReward,
  findNearbyCheckInTargets,
  formatPoints,
  RewardItem,
} from '@/lib/rewards';
import { getProgramInfo } from '@/lib/rewardPrograms';
import {
  loadUnifiedRewards,
  saveUnifiedRewards,
  getRewardsUserId,
  getActivePoints,
} from '@/lib/rewardsStorage';
import type { UnifiedRewardsData } from '@/lib/rewardsProfile';
import { useMileageTracker } from '@/lib/useMileageTracker';
import RewardsDisclosure from './RewardsDisclosure';
import { getMembershipPlanId } from '@/lib/membershipSubscription';
import { canEarnLoyaltyPoints, getMembershipPlan } from '@/lib/membershipPlans';

interface RewardsPanelProps {
  user: { id: string; username?: string } | null;
  parks: Park[];
  userLocation: { lat: number; lng: number } | null;
  onRequestSignIn: () => void;
  onRequestUpgrade: () => void;
  onPointsChange?: (points: number) => void;
}

type RewardCategory = 'all' | 'fuel' | 'propane' | 'gear';

export default function RewardsPanel({
  user,
  parks,
  userLocation,
  onRequestSignIn,
  onRequestUpgrade,
  onPointsChange,
}: RewardsPanelProps) {
  const userId = getRewardsUserId(user?.id);
  const membershipPlanId = getMembershipPlanId(user?.id);
  const membershipPlan = getMembershipPlan(membershipPlanId);
  const canEarn = canEarnLoyaltyPoints(membershipPlanId);
  const [rewards, setRewards] = useState<UnifiedRewardsData>(() => {
    const loaded = loadUnifiedRewards(userId);
    return { ...loaded, activeProgram: 'mileage' };
  });
  const [rewardCategory, setRewardCategory] = useState<RewardCategory>('all');

  const programInfo = getProgramInfo('mileage');
  const mileage = rewards.mileage;
  const activePoints = mileage.totalPoints;

  const persist = useCallback(
    (next: UnifiedRewardsData) => {
      const fixed = { ...next, activeProgram: 'mileage' as const };
      setRewards(fixed);
      saveUnifiedRewards(userId, fixed);
      onPointsChange?.(getActivePoints(fixed));
    },
    [userId, onPointsChange]
  );

  useEffect(() => {
    const loaded = loadUnifiedRewards(userId);
    const next = { ...loaded, activeProgram: 'mileage' as const };
    setRewards(next);
    saveUnifiedRewards(userId, next);
    onPointsChange?.(getActivePoints(next));
  }, [userId, onPointsChange]);

  const handleMilesTick = useCallback(
    (miles: number) => {
      setRewards((current) => {
        const next = {
          ...current,
          activeProgram: 'mileage' as const,
          mileage: addMileagePoints(current.mileage, miles),
        };
        saveUnifiedRewards(userId, next);
        onPointsChange?.(getActivePoints(next));
        return next;
      });
    },
    [userId, onPointsChange]
  );

  const { isTracking, sessionMiles, gpsError, startTracking, stopTracking, resetSession } =
    useMileageTracker(handleMilesTick);

  const mileageTier = getTierForMiles(mileage.totalMiles);
  const mileageNextTier = getNextTier(mileageTier);
  const mileageProgress = mileageNextTier
    ? ((mileage.totalMiles - mileageTier.minMiles) / (mileageNextTier.minMiles - mileageTier.minMiles)) * 100
    : 100;

  const nearby = useMemo(() => {
    if (!userLocation) return { campsites: [] as Park[], boondocking: [] };
    return findNearbyCheckInTargets(userLocation.lat, userLocation.lng, parks);
  }, [userLocation, parks]);

  const filteredRewards = useMemo(() => {
    let items = REWARD_CATALOG;
    if (rewardCategory !== 'all') items = items.filter((r) => r.category === rewardCategory);
    return items;
  }, [rewardCategory]);

  const handleMileageCheckIn = (type: 'campsite' | 'boondocking', id: string, name: string) => {
    const { profile: next, points, error } = performCheckIn(
      mileage,
      type,
      id,
      name,
      membershipPlanId
    );
    if (error) return toast.error(error);
    persist({ ...rewards, mileage: next });
    toast.success(`+${points} points! Checked in at ${name}`);
  };

  const handleRedeem = (reward: RewardItem) => {
    const { profile: next, success, error } = redeemReward(mileage, reward);
    if (!success) return toast.error(error);
    persist({ ...rewards, mileage: next });
    toast.success(`${reward.name} redeemed! Check your email for delivery.`);
  };

  const handleStopDrive = () => {
    stopTracking();
    if (sessionMiles > 0) toast.success(`Drive logged: ${sessionMiles.toFixed(1)} miles this session`);
    resetSession();
  };

  const activityLog = mileage.activityLog;

  if (!user) {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-12 sm:py-16">
        <div className="max-w-md mx-auto text-center space-y-5 p-8 rounded-3xl border border-slate-700 bg-slate-900/80">
          <div className="w-14 h-14 rounded-2xl bg-amber-900/40 flex items-center justify-center mx-auto">
            <Gift className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold">Sign in to earn loyalty points</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Loyalty rewards are available to paid members (Weekender or higher). Sign in to check your
            membership or upgrade on the Trips tab.
          </p>
          <button
            type="button"
            onClick={onRequestSignIn}
            className="w-full flex items-center justify-center gap-2 bg-white text-black h-11 rounded-3xl font-semibold text-sm"
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (!canEarn) {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-12 sm:py-16">
        <div className="max-w-md mx-auto text-center space-y-5 p-8 rounded-3xl border border-amber-800/50 bg-amber-950/20">
          <div className="w-14 h-14 rounded-2xl bg-amber-900/40 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold">Loyalty rewards require a paid membership</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Campfire (free) does not include loyalty points, check-ins, or redemptions. Upgrade to
            Weekender or higher to start earning.
          </p>
          <button
            type="button"
            onClick={onRequestUpgrade}
            className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white h-11 rounded-3xl font-semibold text-sm"
          >
            View membership plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-5">
        <h3 className="font-semibold text-sm text-slate-300 mb-1">Mileage rewards</h3>
        <p className="text-xs text-slate-400">
          Earn points by tracking drives and checking in at campsites. rvchain does not book park stays.
        </p>
      </div>

      <RewardsDisclosure />

      {membershipPlan.checkInBonusPercent > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-emerald-800/50 bg-emerald-950/30 text-sm text-emerald-200">
          <Zap className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            <span className="font-semibold">{membershipPlan.name}</span> member perk:{' '}
            +{membershipPlan.checkInBonusPercent}% bonus points on every check-in
          </span>
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl border border-amber-700/40 bg-gradient-to-br from-amber-950/60 via-slate-900 to-green-950/40 p-6 sm:p-8">
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

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-2xl border font-semibold text-sm"
            style={{ borderColor: mileageTier.color, color: mileageTier.color, backgroundColor: `${mileageTier.color}15` }}
          >
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
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, mileageProgress)}%`, backgroundColor: mileageNextTier.color }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

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
          {gpsError && (
            <div className="text-sm text-amber-400 bg-amber-950/30 border border-amber-800/50 rounded-xl p-3 mb-4">
              {gpsError}
            </div>
          )}
          <div className="flex gap-2">
            {!isTracking ? (
              <button
                type="button"
                onClick={startTracking}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 h-12 rounded-3xl font-semibold"
              >
                <Play className="w-4 h-4" /> Start Tracking
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopDrive}
                className="flex-1 flex items-center justify-center gap-2 bg-red-800/80 hover:bg-red-700 h-12 rounded-3xl font-semibold"
              >
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
            <p className="text-center py-8 text-slate-400 text-sm">
              Use &quot;Use My Location&quot; on the home screen first.
            </p>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {nearby.campsites.map((park) => (
                <button
                  key={park.id}
                  type="button"
                  onClick={() => handleMileageCheckIn('campsite', park.id, park.name)}
                  className="w-full flex items-center justify-between p-3 bg-slate-950 border border-slate-800 hover:border-emerald-700 rounded-2xl text-left"
                >
                  <div>
                    <div className="font-medium text-sm">{park.name}</div>
                    <div className="text-xs text-slate-400">+250 pts</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-sky-400" />
          <h3 className="font-semibold text-lg">Mileage Tiers</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {REWARD_TIERS.map((t) => {
            const active = t.id === mileageTier.id;
            const unlocked = mileage.totalMiles >= t.minMiles;
            return (
              <div
                key={t.id}
                className={`p-3 sm:p-4 rounded-2xl border ${active ? 'border-2' : 'border-slate-800'}`}
                style={active ? { borderColor: t.color } : undefined}
              >
                <div className="font-semibold text-sm" style={{ color: unlocked ? t.color : '#64748b' }}>
                  {t.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{t.minMiles.toLocaleString()}+ mi</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-lg">Redeem Rewards</h3>
          </div>
          <div className="flex gap-1">
            {(['all', 'fuel', 'propane', 'gear'] as RewardCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setRewardCategory(cat)}
                className={`text-[10px] px-2 py-1 rounded-lg capitalize ${
                  rewardCategory === cat ? 'bg-amber-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredRewards.map((reward) => {
            const canAfford = activePoints >= reward.pointsCost;
            const hasTier =
              mileage.totalMiles >= (REWARD_TIERS.find((t) => t.id === reward.tierRequired)?.minMiles ?? 0);
            return (
              <div key={reward.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex flex-col">
                <div className="text-2xl mb-1">{reward.icon}</div>
                <div className="font-semibold text-sm">{reward.name}</div>
                <div className="text-xs text-slate-400 flex-1 mt-0.5">{reward.description}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-amber-300 font-bold text-sm">{formatPoints(reward.pointsCost)} pts</span>
                  <button
                    type="button"
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford || !hasTier}
                    className="text-xs px-3 py-1.5 rounded-xl font-semibold bg-green-700 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
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
              <div
                key={entry.id}
                className="flex items-center justify-between text-sm py-2 border-b border-slate-800 last:border-0"
              >
                <span className="text-slate-300 text-xs sm:text-sm">{entry.description}</span>
                <span className={entry.points >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                  {entry.points >= 0 ? '+' : ''}
                  {formatPoints(entry.points)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
