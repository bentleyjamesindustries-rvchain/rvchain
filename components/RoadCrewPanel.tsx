'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Gift, Trophy, Star, Zap, LogIn, Lock, Play, Square, Navigation, Users,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ROAD_CREW_PERKS,
  ROAD_CREW_TIERS,
  getRoadCrewTier,
  getNextRoadCrewTier,
  redeemRoadCrewPerk,
  formatRoadCrewPoints,
  roadCrewTierMeets,
  type RoadCrewPerk,
} from '@/lib/roadCrew';
import { ROAD_CREW_DISCLOSURE } from '@/lib/roadCrewDisclosure';
import {
  loadUnifiedRewards,
  saveUnifiedRewards,
  getRewardsUserId,
  getActivePoints,
} from '@/lib/rewardsStorage';
import type { UnifiedRewardsData } from '@/lib/rewardsProfile';
import { addMileagePoints } from '@/lib/rewards';
import { useMileageTracker } from '@/lib/useMileageTracker';
import { getMembershipPlanId } from '@/lib/membershipSubscription';
import { canEarnLoyaltyPoints, getMembershipPlan } from '@/lib/membershipPlans';
import { Info } from 'lucide-react';

interface RoadCrewPanelProps {
  user: { id: string; username?: string } | null;
  onRequestSignIn: () => void;
  onRequestUpgrade: () => void;
  onPointsChange?: (points: number) => void;
}

export default function RoadCrewPanel({
  user,
  onRequestSignIn,
  onRequestUpgrade,
  onPointsChange,
}: RoadCrewPanelProps) {
  const userId = getRewardsUserId(user?.id);
  const planId = getMembershipPlanId(user?.id);
  const plan = getMembershipPlan(planId);
  const canEarn = canEarnLoyaltyPoints(planId);
  const [rewards, setRewards] = useState<UnifiedRewardsData>(() => {
    const loaded = loadUnifiedRewards(userId);
    return { ...loaded, activeProgram: 'mileage' };
  });

  const mileage = rewards.mileage;
  const points = mileage.totalPoints;
  const tier = getRoadCrewTier(points);
  const nextTier = getNextRoadCrewTier(tier);
  const progress = nextTier
    ? ((points - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100
    : 100;

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
      if (!canEarn) return;
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
    [userId, onPointsChange, canEarn]
  );

  const { isTracking, sessionMiles, gpsError, startTracking, stopTracking, resetSession } =
    useMileageTracker(handleMilesTick);

  const handleStop = () => {
    stopTracking();
    if (sessionMiles > 0) toast.success(`Drive logged: ${sessionMiles.toFixed(1)} mi`);
    resetSession();
  };

  const handleRedeem = (perk: RoadCrewPerk) => {
    const { profile, success, error } = redeemRoadCrewPerk(mileage, perk);
    if (!success) return toast.error(error);
    persist({ ...rewards, mileage: profile });
    toast.success(`${perk.name} redeemed (demo)!`);
  };

  if (!user) {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-12">
        <div className="max-w-md mx-auto text-center space-y-5 p-8 rounded-3xl border border-slate-700 bg-slate-900/80">
          <Users className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-xl font-semibold">Join Road Crew</h2>
          <p className="text-sm text-slate-400">
            Earn for trips, forum, Market, and Explorer adventures — not campground bookings. Sign in
            to continue.
          </p>
          <button
            type="button"
            onClick={onRequestSignIn}
            className="w-full h-11 rounded-3xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" /> Sign in
          </button>
        </div>
      </div>
    );
  }

  if (!canEarn) {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-12">
        <div className="max-w-md mx-auto text-center space-y-5 p-8 rounded-3xl border border-amber-800/50 bg-amber-950/20">
          <Lock className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-xl font-semibold">Road Crew is for members</h2>
          <p className="text-sm text-slate-400">
            Upgrade to Weekender or higher to earn trail points for living on rvchain.
          </p>
          <button
            type="button"
            onClick={onRequestUpgrade}
            className="w-full h-11 rounded-3xl bg-emerald-700 hover:bg-emerald-600 font-semibold text-sm"
          >
            View membership plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      <div className="rounded-3xl border border-amber-700/40 bg-gradient-to-br from-amber-950/50 via-slate-900 to-emerald-950/30 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-1">
              <Users className="w-4 h-4" />
              Road Crew
            </div>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight">
              Earn for living on rvchain
            </h2>
            <p className="text-slate-400 mt-2 max-w-lg text-sm">
              Trips, forum posts, Market listings, Explorer finds — and optional drive miles. Not a
              campground booking club.
            </p>
            {plan.checkInBonusPercent > 0 && (
              <p className="text-xs text-emerald-300 mt-2">
                {plan.name} boost: +{plan.checkInBonusPercent}% on Road Crew earn actions
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-bold text-amber-300">
              {formatRoadCrewPoints(points)}
            </div>
            <div className="text-sm text-slate-400">trail points</div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-2xl border font-semibold text-sm"
            style={{ borderColor: tier.color, color: tier.color, backgroundColor: `${tier.color}15` }}
          >
            <Star className="w-4 h-4" />
            {tier.name}
            <span className="text-xs opacity-70">({tier.multiplier}×)</span>
          </div>
          <div className="text-sm text-slate-400">{tier.tagline}</div>
          {nextTier && (
            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>→ {nextTier.name}</span>
                <span>{nextTier.minPoints - points} pts</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, progress)}%`, backgroundColor: nextTier.color }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="bg-slate-900/80 border border-slate-700 rounded-3xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm text-slate-200">{ROAD_CREW_DISCLOSURE.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{ROAD_CREW_DISCLOSURE.summary}</p>
            <ul className="mt-2 text-[11px] text-slate-500 list-disc pl-4 space-y-1">
              {ROAD_CREW_DISCLOSURE.bullets.slice(0, 4).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" /> How to earn
        </h3>
        <ul className="text-sm text-slate-400 space-y-1.5 list-disc pl-5">
          <li>Create trips &amp; complete checklist items (Trips tab)</li>
          <li>Post in the camper forum</li>
          <li>Publish a Market listing or complete a demo sale</li>
          <li>Explorers: mark a plant found on the scavenger hunt</li>
          <li>Optional: track drive miles below (secondary)</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold">Optional mileage</h3>
          </div>
          <div className="text-3xl font-bold text-emerald-300">{sessionMiles.toFixed(1)}</div>
          <div className="text-xs text-slate-400 mb-3">miles this session</div>
          {gpsError && (
            <p className="text-xs text-amber-400 mb-2">{gpsError}</p>
          )}
          {!isTracking ? (
            <button
              type="button"
              onClick={startTracking}
              className="w-full h-11 rounded-2xl bg-emerald-700 font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Start tracking
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStop}
              className="w-full h-11 rounded-2xl bg-red-800/80 font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Square className="w-4 h-4" /> Stop &amp; save
            </button>
          )}
          <p className="text-[10px] text-slate-500 mt-2">
            Total logged: {mileage.totalMiles.toFixed(0)} mi · secondary to app activity
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-sky-400" />
            <h3 className="font-semibold">Crew tiers</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ROAD_CREW_TIERS.map((t) => {
              const active = t.id === tier.id;
              const unlocked = points >= t.minPoints;
              return (
                <div
                  key={t.id}
                  className={`p-3 rounded-2xl border text-sm ${active ? 'border-2' : 'border-slate-800'}`}
                  style={active ? { borderColor: t.color } : undefined}
                >
                  <div className="font-semibold" style={{ color: unlocked ? t.color : '#64748b' }}>
                    {t.name}
                  </div>
                  <div className="text-[10px] text-slate-500">{t.minPoints}+ pts · {t.multiplier}×</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-lg">Redeem on-platform perks</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ROAD_CREW_PERKS.map((perk) => {
            const canAfford = points >= perk.pointsCost;
            const hasTier = roadCrewTierMeets(tier.id, perk.tierRequired);
            return (
              <div
                key={perk.id}
                className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex flex-col"
              >
                <div className="text-2xl mb-1">{perk.icon}</div>
                <div className="font-semibold text-sm">{perk.name}</div>
                <div className="text-xs text-slate-400 flex-1 mt-0.5">{perk.description}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-amber-300 font-bold text-sm">
                    {formatRoadCrewPoints(perk.pointsCost)} pts
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRedeem(perk)}
                    disabled={!canAfford || !hasTier}
                    className="text-xs px-3 py-1.5 rounded-xl font-semibold bg-green-700 hover:bg-green-600 disabled:opacity-40"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {mileage.activityLog.length > 0 && (
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" /> Recent activity
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {mileage.activityLog.slice(0, 12).map((entry) => (
              <div
                key={entry.id}
                className="flex justify-between text-sm py-2 border-b border-slate-800 last:border-0 gap-2"
              >
                <span className="text-slate-300 text-xs sm:text-sm">{entry.description}</span>
                <span
                  className={
                    entry.points >= 0 ? 'text-emerald-400 font-medium shrink-0' : 'text-red-400 font-medium shrink-0'
                  }
                >
                  {entry.points >= 0 ? '+' : ''}
                  {formatRoadCrewPoints(entry.points)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
