'use client';

import { useState } from 'react';
import { Check, Lock, Sparkles } from 'lucide-react';
import {
  MEMBERSHIP_PLANS,
  formatPlanPrice,
  planRank,
  type BillingInterval,
  type MembershipPlanId,
} from '@/lib/membershipPlans';

interface MembershipTierPickerProps {
  activePlan: MembershipPlanId;
  activeInterval?: BillingInterval;
  onSelectPlan: (plan: MembershipPlanId, interval: BillingInterval, startTrial: boolean) => void;
  signedIn: boolean;
  onRequestSignIn: () => void;
}

export default function MembershipTierPicker({
  activePlan,
  activeInterval = 'monthly',
  onSelectPlan,
  signedIn,
  onRequestSignIn,
}: MembershipTierPickerProps) {
  const [interval, setInterval] = useState<BillingInterval>(activeInterval);

  const handleSelect = (planId: MembershipPlanId, startTrial: boolean) => {
    if (!signedIn) {
      onRequestSignIn();
      return;
    }
    onSelectPlan(planId, interval, startTrial);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 w-fit mx-auto sm:mx-0">
        <button
          type="button"
          onClick={() => setInterval('monthly')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            interval === 'monthly' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setInterval('annual')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            interval === 'annual' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Annual
          <span className="ml-1 text-[10px] opacity-80">save ~2 mo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {MEMBERSHIP_PLANS.map((plan) => {
          const isActive = activePlan === plan.id;
          const isUpgrade = planRank(plan.id) > planRank(activePlan);
          const showTrial = plan.trialDays > 0 && !isActive;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border p-4 transition ${
                isActive
                  ? 'border-emerald-600/60 bg-emerald-950/20 shadow-lg shadow-emerald-900/10'
                  : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
              }`}
            >
              {isActive && plan.id !== 'campfire' && (
                <span className="absolute -top-2 right-3 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
              {showTrial && (
                <span className="absolute -top-2 left-3 text-[10px] font-bold bg-sky-600 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" />
                  {plan.trialDays}-day trial
                </span>
              )}

              <div className={`text-xs font-semibold uppercase tracking-wider ${plan.accent}`}>
                {plan.name}
              </div>
              <div className="text-2xl font-bold mt-1">{formatPlanPrice(plan, interval)}</div>
              <p className="text-xs text-slate-400 mt-1 mb-3 min-h-[2.5rem]">{plan.tagline}</p>

              <ul className="space-y-1.5 flex-1 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                    <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.id === 'campfire' ? (
                <div className="text-center text-xs text-slate-500 py-2 border border-slate-800 rounded-2xl">
                  {isActive ? 'Current plan' : 'Included free'}
                </div>
              ) : showTrial ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSelect(plan.id, true)}
                    className="w-full h-10 rounded-2xl text-sm font-semibold bg-sky-700 hover:bg-sky-600 text-white transition"
                  >
                    Start free trial (demo)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelect(plan.id, false)}
                    className="w-full h-9 rounded-2xl text-xs font-medium border border-slate-600 text-slate-300 hover:bg-slate-800 transition"
                  >
                    Subscribe without trial (demo)
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSelect(plan.id, false)}
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

              {!signedIn && plan.id !== 'campfire' && (
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mt-2">
                  <Lock className="w-3 h-3" /> Sign in required
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}