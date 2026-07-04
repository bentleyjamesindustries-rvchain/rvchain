'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Calendar, Lock, Printer, MapPin, ChevronRight, LayoutDashboard,
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
  getTripPlannerPlanId,
  subscribeToTripPlanner,
  getTripPlannerSubscription,
} from '@/lib/tripPlannerSubscription';
import {
  getTripPlannerPlan,
  maxSelectablePacks,
  availablePacksForPlan,
  canAccessChecklist,
  type TripPlannerPlanId,
} from '@/lib/tripPlannerPlans';
import {
  CHECKLIST_PACKS,
  getChecklistPack,
  type ChecklistPackId,
} from '@/lib/tripChecklists';
import { DEMO_NOTICE_SHORT } from '@/lib/demoMode';
import TripPlanTierPicker from './TripPlanTierPicker';
import TripPlannerDisclosure from './TripPlannerDisclosure';
import CampingChecklist from './CampingChecklist';

interface TripPlannerPanelProps {
  user: { id: string; email?: string } | null;
  allParks: Park[];
  quickAddParks: Park[];
  onRequestSignIn: () => void;
}

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
  const [activePackTab, setActivePackTab] = useState<ChecklistPackId>('backpacking');
  const [checklistRefresh, setChecklistRefresh] = useState(0);

  const planId = getTripPlannerPlanId(user?.id);
  const plan = getTripPlannerPlan(planId);
  const subscription = user ? getTripPlannerSubscription(user.id) : null;

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
    const title = newTripTitle.trim();

    if (!supabaseReady) {
      const trip = createLocalTrip(user.id, title);
      setUserTrips([trip, ...userTrips]);
      setNewTripTitle('');
      setSelectedTrip(trip);
      setTripParks([]);
      toast.success('Trip created!');
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
        const trip = createLocalTrip(user.id, title);
        setUserTrips([trip, ...userTrips]);
        setNewTripTitle('');
        setSelectedTrip(trip);
        setTripParks([]);
        toast.success('Trip created (saved locally).');
        return;
      }
      toast.error(error.message || 'Failed to create trip.');
      return;
    }

    setUserTrips([data as StoredTrip, ...userTrips]);
    setNewTripTitle('');
    setSelectedTrip(data as StoredTrip);
    setTripParks([]);
    toast.success('Trip created!');
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
    if (!supabaseReady) {
      setTripParks(addLocalTripPark(user.id, selectedTrip.id, parkId, allParks));
      toast.success('Added to trip!');
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
        toast.success('Added to trip!');
        return;
      }
      toast.error(error.message || "Couldn't add park.");
      return;
    }
    const { data } = await supabase
      .from('trip_parks')
      .select('*, parks(*)')
      .eq('trip_id', selectedTrip.id)
      .order('visit_order');
    if (data) setTripParks(data);
    toast.success('Added to trip!');
  };

  const handleSubscribe = (newPlan: TripPlannerPlanId) => {
    if (!user) return onRequestSignIn();
    if (newPlan === 'free') return;
    subscribeToTripPlanner(user.id, newPlan);
    toast.success(`Subscribed to ${getTripPlannerPlan(newPlan).name} (demo)!`);
    setChecklistRefresh((n) => n + 1);
  };

  const toggleCamperPack = (packId: ChecklistPackId) => {
    if (!selectedTrip || planId === 'free') return;
    const current = selectedTrip.camper_packs ?? [];
    const has = current.includes(packId);
    let next: ChecklistPackId[];
    if (has) {
      next = current.filter((p) => p !== packId);
    } else if (maxPacks === 1) {
      next = [packId];
    } else {
      next = [...current, packId];
    }
    saveTripMeta({ camper_packs: next });
    setActivePackTab(packId);
  };

  const handlePrint = () => {
    if (!plan.printable) {
      toast.info('Upgrade to Explorer or higher to print checklists.');
      return;
    }
    window.print();
  };

  const selectedPacks = selectedTrip?.camper_packs ?? [];
  const activeChecklistPack = getChecklistPack(activePackTab);
  const checkedIds =
    user && selectedTrip
      ? getTripChecklistProgress(user.id, selectedTrip.id, activePackTab)
      : [];

  void checklistRefresh;

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 pb-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="section-intro">
          <h2 className="text-xl sm:text-2xl font-semibold">Trip Planner</h2>
          <p className="text-slate-200 text-sm mt-1">
            Plan routes, dates, and camping checklists for your style of travel.
          </p>
          <p className="text-[10px] text-amber-400/80 mt-1">{DEMO_NOTICE_SHORT}</p>
        </div>
        {planId !== 'free' && subscription && (
          <div className="text-xs bg-emerald-950/40 border border-emerald-800/40 px-3 py-2 rounded-2xl text-emerald-300">
            {plan.name} plan · demo since {new Date(subscription.subscribedAt).toLocaleDateString()}
          </div>
        )}
      </div>

      <TripPlanTierPicker
        activePlan={planId}
        onSelectPlan={handleSubscribe}
        signedIn={Boolean(user)}
        onRequestSignIn={onRequestSignIn}
      />

      <TripPlannerDisclosure />

      <div className="flex flex-col min-[400px]:flex-row gap-2">
        <input
          value={newTripTitle}
          onChange={(e) => setNewTripTitle(e.target.value)}
          placeholder="New trip name (e.g. Yellowstone 2026)"
          disabled={!user}
          className="bg-slate-900 border border-slate-700 px-4 rounded-2xl text-sm flex-1 min-w-0 h-11 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={createTrip}
          disabled={!user}
          className="bg-green-700 hover:bg-green-600 disabled:opacity-50 px-5 rounded-3xl text-sm font-semibold flex items-center justify-center gap-1 h-11"
        >
          <Plus className="w-4 h-4" /> Create Trip
        </button>
      </div>

      {!user ? (
        <div className="text-center py-12 border border-slate-800 rounded-3xl">
          <p className="text-slate-400 mb-4">Sign in to create trips and unlock checklists.</p>
          <button
            type="button"
            onClick={onRequestSignIn}
            className="bg-white text-black px-6 py-2 rounded-3xl font-semibold"
          >
            Sign In
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <div className="font-medium flex items-center justify-between">
              <span>My Trips ({userTrips.length})</span>
              {plan.routeSummary && userTrips.length > 1 && (
                <span className="text-[10px] text-sky-400 flex items-center gap-1">
                  <LayoutDashboard className="w-3 h-3" /> Multi-trip
                </span>
              )}
            </div>
            {userTrips.length === 0 ? (
              <div className="text-sm text-slate-400 p-4 border border-slate-800 rounded-2xl">
                No trips yet. Create one above!
              </div>
            ) : (
              <div className="space-y-2">
                {userTrips.map((trip) => (
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
                    <div className="text-xs text-slate-400">
                      {trip.start_date && trip.end_date
                        ? `${trip.start_date} → ${trip.end_date}`
                        : new Date(trip.created_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-5">
            {selectedTrip ? (
              <>
                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-5 space-y-4">
                  <div className="font-semibold text-xl">{selectedTrip.title}</div>

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

                  {planId !== 'free' && (
                    <label className="block text-xs">
                      <span className="text-slate-400 mb-1 block">Trip notes</span>
                      <textarea
                        value={selectedTrip.notes ?? ''}
                        onChange={(e) => saveTripMeta({ notes: e.target.value })}
                        rows={2}
                        placeholder="Reservations, permits, pet notes…"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm resize-none"
                      />
                    </label>
                  )}

                  <div>
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      Park stops ({tripParks.length})
                    </div>
                    {tripParks.length === 0 ? (
                      <p className="text-xs text-slate-500 border border-dashed border-slate-700 p-4 rounded-2xl">
                        Add parks from Discover or quick-add below.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {tripParks.map((tp, idx) => (
                          <div
                            key={`${tp.trip_id}-${tp.park_id}-${idx}`}
                            className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-2xl text-sm"
                          >
                            <span>{tp.parks?.name ?? 'Park'}</span>
                            <span className="text-xs text-emerald-400">Stop #{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {plan.routeSummary && tripParks.length > 0 && (
                      <p className="text-[11px] text-sky-400/90 mt-2">
                        Route: {tripParks.map((tp) => tp.parks?.city ?? tp.parks?.name).filter(Boolean).join(' → ')}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="text-xs text-slate-400 mb-2">Quick add</div>
                    <div className="flex flex-wrap gap-2">
                      {quickAddParks.slice(0, 8).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addParkToTrip(p.id)}
                          className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1 rounded-2xl"
                        >
                          + {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Checklists */}
                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      Camping checklists
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

                  {planId === 'free' ? (
                    <div className="text-center py-8 border border-dashed border-slate-700 rounded-2xl">
                      <Lock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">Subscribe to unlock camper checklists.</p>
                      <p className="text-xs text-slate-500 mt-1">Backpacking, RV, vehicle prep &amp; more.</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs text-slate-400 mb-3">
                        {maxPacks === 1
                          ? 'Pick one camper style for this trip (Explorer plan):'
                          : 'Select checklist packs for this trip:'}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {CHECKLIST_PACKS.filter((p) => availablePacks.includes(p.id)).map((pack) => {
                          const selected = selectedPacks.includes(pack.id);
                          return (
                            <button
                              key={pack.id}
                              type="button"
                              onClick={() => toggleCamperPack(pack.id)}
                              className={`text-xs px-3 py-1.5 rounded-2xl border transition ${
                                selected
                                  ? 'bg-emerald-900/40 border-emerald-600 text-emerald-200'
                                  : 'border-slate-600 text-slate-400 hover:border-slate-500'
                              }`}
                            >
                              {pack.icon} {pack.title}
                            </button>
                          );
                        })}
                      </div>

                      {selectedPacks.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-6">
                          Select a camper type above to open its checklist.
                        </p>
                      ) : (
                        <>
                          <div className="flex flex-wrap gap-1 mb-4 border-b border-slate-800 pb-2">
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
                          canAccessChecklist(planId, activePackTab, selectedPacks) ? (
                            <CampingChecklist
                              pack={activeChecklistPack}
                              checkedIds={checkedIds}
                              onToggle={(itemId) => {
                                if (!user || !selectedTrip) return;
                                toggleChecklistItem(user.id, selectedTrip.id, activePackTab, itemId);
                                setChecklistRefresh((n) => n + 1);
                              }}
                            />
                          ) : (
                            <div className="text-sm text-amber-400/90 flex items-center gap-2 py-4">
                              <Lock className="w-4 h-4" />
                              Upgrade to access this checklist pack.
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 border border-slate-800 rounded-3xl flex flex-col items-center gap-2">
                <ChevronRight className="w-6 h-6 opacity-40" />
                Select or create a trip to start planning.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}