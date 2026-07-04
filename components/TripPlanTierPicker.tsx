'use client';

import { Check, Lock } from 'lucide-react';
import {
  TRIP_PLANNER_PLANS,
  type TripPlannerPlanId,
  planRank,
} from '@/lib/tripPlannerPlans';

interface TripPlanTierPickerProps {
  activePlan: TripPlannerPlanId;
  onSelectPlan: (plan: TripPlannerPlanId) => void;
  signedIn: boolean;
  onRequestSignIn: () => void;
}

export default function TripPlanTierPicker({
  activePlan,
  onSelectPlan,
  signedIn,
  onRequestSignIn,
}: TripPlanTierPickerProps) {
  const handleSelect = (planId: TripPlannerPlanId) => {
    if (!signedIn) {
      onRequestSignIn();
      return;
    }
    onSelectPlan(planId);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {TRIP_PLANNER_PLANS.map((plan) => {
        const isActive = activePlan === plan.id;
        const isUpgrade = planRank(plan.id) > planRank(activePlan);

        return (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-3xl border p-4 transition ${
              isActive
                ? 'border-emerald-600/60 bg-emerald-950/20 shadow-lg shadow-emerald-900/10'
                : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
            }`}
          >
            {isActive && plan.id !== 'free' && (
              <span className="absolute -top-2 right-3 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                Active
              </span>
            )}

            <div className={`text-xs font-semibold uppercase tracking-wider ${plan.accent}`}>
              {plan.name}
            </div>
            <div className="text-2xl font-bold mt-1">{plan.priceLabel}</div>
            <p className="text-xs text-slate-400 mt-1 mb-3 min-h-[2.5rem]">{plan.tagline}</p>

            <ul className="space-y-1.5 flex-1 mb-4">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                  <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {plan.id === 'free' ? (
              <div className="text-center text-xs text-slate-500 py-2 border border-slate-800 rounded-2xl">
                {isActive ? 'Current plan' : 'Included'}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleSelect(plan.id)}
                className={`w-full h-10 rounded-2xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-slate-800 text-slate-300 border border-slate-600'
                    : isUpgrade
                      ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
                }`}
              >
                {isActive ? 'Subscribed (demo)' : isUpgrade ? 'Upgrade (demo)' : 'Switch plan (demo)'}
              </button>
            )}

            {!signedIn && plan.id !== 'free' && (
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mt-2">
                <Lock className="w-3 h-3" /> Sign in required
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}