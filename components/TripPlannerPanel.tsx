'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Calendar, Lock, Printer, MapPin, ChevronRight, ChevronDown, LayoutDashboard, ListChecks,
} from 'lucide-react';
import { toast } from 'sonner';
import { Park } from '@/lib/parks';
import { supabase } from '@/lib/supabaseClient';
import { isMissingTableError } from '@/lib/supabaseSetup';
import {
  listLocalTrips,
  createLocalTrip,
  updateLocalTrip,
  listLocalTripParks,
  addLocalTripPark,
  getTripChecklistProgress,
  toggleChecklistItem,
  StoredTrip,
  StoredTripPark,
} from '@/lib/localTrips';
import {
  getMembershipPlanId,
  subscribeToMembership,
  getMembershipSubscription,
  isOnTrial,
} from '@/lib/membershipSubscription';
import {
  getMembershipPlan,
  maxSelectablePacks,
  availablePacksForPlan,
  canAccessChecklist,
  canCreateTrip,
  canUseTripPlanner,
  type MembershipPlanId,
} from '@/lib/membershipPlans';
import type { BillingInterval } from '@/lib/membershipPlans';
import {
  getChecklistPack,
  countTripChecklistTotals,
  type ChecklistPackId,
} from '@/lib/tripChecklists';
import { DEMO_NOTICE_SHORT } from '@/lib/demoMode';
import { awardRoadCrewForUser } from '@/lib/roadCrew';
import MembershipTierPicker from './MembershipTierPicker';
import MembershipDisclosure from './MembershipDisclosure';
import CampingChecklist from './CampingChecklist';
import ChecklistPackPicker from './ChecklistPackPicker';

interface TripPlannerPanelProps {
  user: { id: string; email?: string } | null;
  allParks: Park[];
  quickAddParks: Park[];
  onRequestSignIn: () => void;
}

type TripWorkspaceTab = 'checklists' | 'stops' | 'details';

export default function TripPlannerPanel({
  user,
  allParks,
  quickAddParks,
  onRequestSignIn,
}: TripPlannerPanelProps) {
  const [userTrips, setUserTrips] = useState<StoredTrip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<StoredTrip | null>(null);
  const [tripParks, setTripParks] = useState<StoredTripPark[]>([]);
  const [newTripTitle, setNewTripTitle] = useState('');
  const [supabaseReady, setSupabaseReady] = useState(true);
  const [activePackTab, setActivePackTab] = useState<ChecklistPackId | null>(null);
  const [checklistRefresh, setChecklistRefresh] = useState(0);
  const [showMembership, setShowMembership] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<TripWorkspaceTab>('checklists');

  const planId = getMembershipPlanId(user?.id);
  const plan = getMembershipPlan(planId);
  const subscription = user ? getMembershipSubscription(user.id) : null;

  const availablePacks = useMemo(() => availablePacksForPlan(planId), [planId]);
  const maxPacks = maxSelectablePacks(planId);

  const loadTrips = useCallback(async () => {
    if (!user) {
      setUserTrips([]);
      return;
    }
    if (!supabaseReady) {
      setUserTrips(listLocalTrips(user.id));
      return;
    }
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      if (isMissingTableError(error)) {
        setSupabaseReady(false);
        setUserTrips(listLocalTrips(user.id));
        return;
      }
      setUserTrips(listLocalTrips(user.id));
      return;
    }
    if (data?.length) {
      setUserTrips(data as StoredTrip[]);
    } else {
      setUserTrips(listLocalTrips(user.id));
    }
  }, [user, supabaseReady]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const loadTripParks = async (trip: StoredTrip) => {
    if (!user) return;
    setSelectedTrip(trip);
    setWorkspaceTab(
      (trip.camper_packs?.length ?? 0) === 0 ? 'checklists' : 'checklists'
    );
    const packs = trip.camper_packs ?? [];
    setActivePackTab(packs[0] ?? null);
    if (!supabaseReady) {
      setTripParks(listLocalTripParks(user.id, trip.id, allParks));
      return;
    }
    const { data, error } = await supabase
      .from('trip_parks')
      .select('*, parks(*)')
      .eq('trip_id', trip.id)
      .order('visit_order');
    if (error && isMissingTableError(error)) {
      setSupabaseReady(false);
      setTripParks(listLocalTripParks(user.id, trip.id, allParks));
      return;
    }
    setTripParks(data || []);
  };

  const createTrip = async () => {
    if (!user) return toast.error('Sign in to create trips.');
    if (!newTripTitle.trim()) return toast.error('Give your trip a name.');
    if (!canUseTripPlanner(planId)) {
      return toast.error('Trip planner requires Weekender or higher.');
    }
    if (!canCreateTrip(planId, userTrips.length)) {
      return toast.error('Trip limit reached on your current plan.');
    }
    const title = newTripTitle.trim();

    const afterCreate = (trip: StoredTrip) => {
      setUserTrips((prev) => [trip, ...prev.filter((t) => t.id !== trip.id)]);
      setNewTripTitle('');
      setSelectedTrip(trip);
      setTripParks([]);
      setActivePackTab(null);
      setWorkspaceTab('checklists');
      toast.success('Trip created — pick a checklist pack to pack smarter.');
      const pts = awardRoadCrewForUser(user.id, planId, 'trip_created', title);
      if (pts > 0) toast.message(`Road Crew +${pts} pts`);
    };

    if (!supabaseReady) {
      afterCreate(createLocalTrip(user.id, title));
      return;
    }

    const { data, error } = await supabase
      .from('trips')
      .insert({ user_id: user.id, title })
      .select()
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        setSupabaseReady(false);
        afterCreate(createLocalTrip(user.id, title));
        return;
      }
      toast.error(error.message || 'Failed to create trip.');
      return;
    }

    afterCreate(data as StoredTrip);
  };

  const saveTripMeta = async (
    patch: Partial<Pick<StoredTrip, 'start_date' | 'end_date' | 'notes' | 'camper_packs'>>
  ) => {
    if (!user || !selectedTrip) return;
    const updated = updateLocalTrip(user.id, selectedTrip.id, patch);
    if (updated) {
      setSelectedTrip(updated);
      setUserTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
    if (supabaseReady && !selectedTrip.id.startsWith('local-')) {
      await supabase.from('trips').update(patch).eq('id', selectedTrip.id);
    }
  };

  const addParkToTrip = async (parkId: string) => {
    if (!selectedTrip || !user) return;
    if (!canUseTripPlanner(planId)) {
      return toast.error('Spot stops require Weekender or higher.');
    }
    if (!supabaseReady) {
      setTripParks(addLocalTripPark(user.id, selectedTrip.id, parkId, allParks));
      toast.success('Spot added to trip!');
      return;
    }
    const { error } = await supabase.from('trip_parks').insert({
      trip_id: selectedTrip.id,
      park_id: parkId,
      visit_order: tripParks.length,
    });
    if (error) {
      if (isMissingTableError(error)) {
        setSupabaseReady(false);
        setTripParks(addLocalTripPark(user.id, selectedTrip.id, parkId, allParks));
        toast.success('Spot added to trip!');
        return;
      }
      toast.error(error.message || "Couldn't add spot.");
      return;
    }
    const { data } = await supabase
      .from('trip_parks')
      .select('*, parks(*)')
      .eq('trip_id', selectedTrip.id)
      .order('visit_order');
    if (data) setTripParks(data);
    toast.success('Spot added to trip!');
  };

  const handleSubscribe = (
    newPlan: MembershipPlanId,
    interval: BillingInterval,
    startTrial: boolean
  ) => {
    if (!user) return onRequestSignIn();
    if (newPlan === 'campfire') return;
    subscribeToMembership(user.id, newPlan, interval, { startTrial });
    const label = getMembershipPlan(newPlan).name;
    const trialNote = startTrial ? ' — 7-day trial started' : '';
    toast.success(`Subscribed to ${label} (${interval}, demo)${trialNote}!`);
    setChecklistRefresh((n) => n + 1);
  };

  const toggleCamperPack = (packId: ChecklistPackId) => {
    if (!selectedTrip || planId === 'campfire') return;
    const current = selectedTrip.camper_packs ?? [];
    const has = current.includes(packId);
    let next: ChecklistPackId[];
    if (has) {
      next = current.filter((p) => p !== packId);
    } else if (maxPacks === 1) {
      next = [packId];
    } else if (current.length >= maxPacks) {
      toast.info(`Your plan allows up to ${maxPacks} checklist packs.`);
      return;
    } else {
      next = [...current, packId];
    }
    saveTripMeta({ camper_packs: next });
    setActivePackTab(next.includes(packId) ? packId : next[0] ?? null);
    if (!has) {
      toast.success(`${getChecklistPack(packId)?.title ?? 'Pack'} added to this trip`);
    }
  };

  const handlePrint = () => {
    if (!plan.printable) {
      toast.info('Upgrade to Weekender or higher to print checklists.');
      return;
    }
    window.print();
  };

  const selectedPacks = selectedTrip?.camper_packs ?? [];
  const activeChecklistPack = activePackTab ? getChecklistPack(activePackTab) : undefined;

  void checklistRefresh;

  const tripProgress = (trip: StoredTrip) => {
    if (!user) return null;
    const packs = trip.camper_packs ?? [];
    if (packs.length === 0) return null;
    return countTripChecklistTotals(packs, (packId) =>
      getTripChecklistProgress(user.id, trip.id, packId)
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 pb-10 space-y-5">
      {/* Header — trip first */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="section-intro">
          <h2 className="text-xl sm:text-2xl font-semibold">Trip planner</h2>
          <p className="text-slate-300 text-sm mt-1 max-w-lg">
            Name a trip, pick packing checklists, and add community spots along the way.
          </p>
          <p className="text-[10px] text-amber-400/80 mt-1">{DEMO_NOTICE_SHORT}</p>
        </div>
        {user && (
          <button
            type="button"
            onClick={() => setShowMembership((v) => !v)}
            className="text-xs flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500 shrink-0"
          >
            Plan: <span className="font-semibold text-emerald-300">{plan.name}</span>
            {subscription && isOnTrial(subscription) && (
              <span className="text-amber-400">· trial</span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition ${showMembership ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {showMembership && (
        <div className="space-y-4 rounded-3xl border border-slate-700 bg-slate-900/50 p-4 sm:p-5">
          <MembershipTierPicker
            activePlan={planId}
            activeInterval={subscription?.billingInterval}
            onSelectPlan={handleSubscribe}
            signedIn={Boolean(user)}
            onRequestSignIn={onRequestSignIn}
          />
          <MembershipDisclosure />
        </div>
      )}

      {!user ? (
        <div className="text-center py-12 border border-slate-800 rounded-3xl space-y-4">
          <p className="text-slate-400">Sign in to create trips and use packing checklists.</p>
          <button
            type="button"
            onClick={onRequestSignIn}
            className="bg-white text-black px-6 py-2 rounded-3xl font-semibold"
          >
            Sign In
          </button>
          <div className="max-w-2xl mx-auto pt-4 px-4 opacity-80">
            <ChecklistPackPicker
              availablePackIds={[]}
              selectedPackIds={[]}
              maxSelectable={1}
              onToggle={() => {}}
              previewAllLocked
            />
          </div>
        </div>
      ) : !canUseTripPlanner(planId) ? (
        <div className="space-y-6">
          <div className="text-center py-10 border border-dashed border-emerald-800/50 rounded-3xl bg-emerald-950/20 px-4">
            <Lock className="w-10 h-10 text-emerald-500/70 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-200">Trip planner is a paid feature</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              Upgrade to Weekender or higher to create trips, add community spots, and unlock packing
              checklists.
            </p>
            <button
              type="button"
              onClick={() => setShowMembership(true)}
              className="mt-4 px-5 h-10 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-sm font-semibold"
            >
              View plans
            </button>
          </div>
          <div className="max-w-2xl mx-auto opacity-90">
            <ChecklistPackPicker
              availablePackIds={[]}
              selectedPackIds={[]}
              maxSelectable={1}
              onToggle={() => {}}
              previewAllLocked
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trip list */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex flex-col gap-2">
              <input
                value={newTripTitle}
                onChange={(e) => setNewTripTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createTrip()}
                placeholder="New trip name…"
                className="bg-slate-900 border border-slate-700 px-4 rounded-2xl text-sm h-11"
              />
              <button
                type="button"
                onClick={createTrip}
                className="bg-green-700 hover:bg-green-600 px-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1 h-11"
              >
                <Plus className="w-4 h-4" /> Create trip
              </button>
            </div>

            <div className="font-medium flex items-center justify-between text-sm">
              <span>My trips ({userTrips.length})</span>
              {plan.routeSummary && userTrips.length > 1 && (
                <span className="text-[10px] text-sky-400 flex items-center gap-1">
                  <LayoutDashboard className="w-3 h-3" /> Multi-trip
                </span>
              )}
            </div>

            {userTrips.length === 0 ? (
              <div className="text-sm text-slate-400 p-4 border border-slate-800 rounded-2xl">
                No trips yet. Create one to open checklists.
              </div>
            ) : (
              <div className="space-y-2">
                {userTrips.map((trip) => {
                  const prog = tripProgress(trip);
                  return (
                    <button
                      key={trip.id}
                      type="button"
                      onClick={() => loadTripParks(trip)}
                      className={`w-full text-left p-3 rounded-2xl border transition ${
                        selectedTrip?.id === trip.id
                          ? 'bg-green-900/30 border-green-700'
                          : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="font-medium">{trip.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                        <span>
                          {trip.start_date && trip.end_date
                            ? `${trip.start_date} → ${trip.end_date}`
                            : new Date(trip.created_at).toLocaleDateString()}
                        </span>
                        {prog && (
                          <span className="text-emerald-400/90">
                            {prog.done}/{prog.total} packed
                          </span>
                        )}
                        {(trip.camper_packs?.length ?? 0) === 0 && (
                          <span className="text-amber-400/80">No checklist yet</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Workspace */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedTrip ? (
              <div className="text-center py-14 text-slate-400 border border-slate-800 rounded-3xl flex flex-col items-center gap-2">
                <ChevronRight className="w-6 h-6 opacity-40" />
                <p>Create or select a trip to plan stops and checklists.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">{selectedTrip.title}</h3>
                  <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800">
                    {(
                      [
                        ['checklists', 'Checklists', ListChecks],
                        ['stops', 'Stops', MapPin],
                        ['details', 'Details', Calendar],
                      ] as const
                    ).map(([id, label, Icon]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setWorkspaceTab(id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                          workspaceTab === id
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {workspaceTab === 'details' && (
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-xs">
                        <span className="text-slate-400 mb-1 block">Start date</span>
                        <input
                          type="date"
                          value={selectedTrip.start_date ?? ''}
                          onChange={(e) => saveTripMeta({ start_date: e.target.value || null })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 h-10 text-sm"
                        />
                      </label>
                      <label className="block text-xs">
                        <span className="text-slate-400 mb-1 block">End date</span>
                        <input
                          type="date"
                          value={selectedTrip.end_date ?? ''}
                          onChange={(e) => saveTripMeta({ end_date: e.target.value || null })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 h-10 text-sm"
                        />
                      </label>
                    </div>
                    <label className="block text-xs">
                      <span className="text-slate-400 mb-1 block">Trip notes</span>
                      <textarea
                        value={selectedTrip.notes ?? ''}
                        onChange={(e) => saveTripMeta({ notes: e.target.value })}
                        rows={3}
                        placeholder="Reservations, permits, pet notes…"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm resize-none"
                      />
                    </label>
                  </div>
                )}

                {workspaceTab === 'stops' && (
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-5 space-y-4">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      Community spots ({tripParks.length})
                    </div>
                    {tripParks.length === 0 ? (
                      <p className="text-xs text-slate-500 border border-dashed border-slate-700 p-4 rounded-2xl">
                        Add stops from the Spots tab or quick-add below.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {tripParks.map((tp, idx) => (
                          <div
                            key={`${tp.trip_id}-${tp.park_id}-${idx}`}
                            className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-2xl text-sm"
                          >
                            <span>{tp.parks?.name ?? 'Spot'}</span>
                            <span className="text-xs text-emerald-400">Stop #{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {plan.routeSummary && tripParks.length > 0 && (
                      <p className="text-[11px] text-sky-400/90">
                        Route:{' '}
                        {tripParks
                          .map((tp) => tp.parks?.city ?? tp.parks?.name)
                          .filter(Boolean)
                          .join(' → ')}
                      </p>
                    )}
                    <div>
                      <div className="text-xs text-slate-400 mb-2">Quick add spots</div>
                      <div className="flex flex-wrap gap-2">
                        {quickAddParks.slice(0, 10).map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => addParkToTrip(p.id)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-2xl"
                          >
                            + {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {workspaceTab === 'checklists' && (
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-5 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-amber-400" />
                        Packing checklists
                      </h3>
                      {plan.printable && selectedPacks.length > 0 && (
                        <button
                          type="button"
                          onClick={handlePrint}
                          className="text-xs flex items-center gap-1 border border-slate-600 px-3 py-1.5 rounded-xl hover:bg-slate-800"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print
                        </button>
                      )}
                    </div>

                    <ChecklistPackPicker
                      availablePackIds={availablePacks}
                      selectedPackIds={selectedPacks}
                      maxSelectable={maxPacks}
                      onToggle={toggleCamperPack}
                    />

                    {selectedPacks.length > 0 && (
                      <>
                        <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-2">
                          {selectedPacks.map((packId) => {
                            const pack = getChecklistPack(packId);
                            if (!pack) return null;
                            return (
                              <button
                                key={packId}
                                type="button"
                                onClick={() => setActivePackTab(packId)}
                                className={`text-xs px-3 py-1.5 rounded-xl ${
                                  activePackTab === packId
                                    ? 'bg-slate-800 text-white'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {pack.icon} {pack.title}
                              </button>
                            );
                          })}
                        </div>

                        {activeChecklistPack &&
                        activePackTab &&
                        canAccessChecklist(planId, activePackTab, selectedPacks) ? (
                          <CampingChecklist
                            pack={activeChecklistPack}
                            checkedIds={getTripChecklistProgress(
                              user.id,
                              selectedTrip.id,
                              activePackTab
                            )}
                            onToggle={(itemId) => {
                              toggleChecklistItem(
                                user.id,
                                selectedTrip.id,
                                activePackTab,
                                itemId
                              );
                              setChecklistRefresh((n) => n + 1);
                            }}
                          />
                        ) : (
                          <p className="text-sm text-slate-500 text-center py-4">
                            Select a pack tab above to open the checklist.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
