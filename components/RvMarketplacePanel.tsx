'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Caravan, Search, X, Plus, MapPin, Gauge, Ruler, Users,
  MessageCircle, Tag, ChevronLeft, Trash2, Info,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  RvListing,
  RvClass,
  RvCondition,
  RV_CLASS_LABELS,
  RV_CONDITION_LABELS,
  RV_FEATURE_OPTIONS,
  formatRvPrice,
  formatListedDate,
} from '@/lib/rvListings';
import {
  loadAllListings,
  saveUserListing,
  loadUserListingsOnly,
  removeUserListing,
  saveListingInterest,
} from '@/lib/rvMarketplaceStorage';
import { DEMO_NOTICE_SHORT } from '@/lib/demoMode';

type MarketView = 'browse' | 'sell' | 'mine';
type PriceFilter = 'all' | 'under30' | '30to75' | '75to125' | 'over125';

const PRICE_FILTERS: { value: PriceFilter; label: string }[] = [
  { value: 'all', label: 'Any price' },
  { value: 'under30', label: 'Under $30k' },
  { value: '30to75', label: '$30k–75k' },
  { value: '75to125', label: '$75k–125k' },
  { value: 'over125', label: '$125k+' },
];

const STATES = ['AZ', 'CA', 'CO', 'FL', 'ID', 'MI', 'OR', 'TN', 'TX'];

interface RvMarketplacePanelProps {
  user: { id: string; email?: string; username?: string } | null;
  displayHandle: string;
  onRequestSignIn: () => void;
}

const EMPTY_FORM = {
  title: '',
  make: '',
  model: '',
  year: String(new Date().getFullYear()),
  rvClass: 'travel-trailer' as RvClass,
  condition: 'good' as RvCondition,
  price: '',
  mileage: '',
  lengthFt: '',
  sleeps: '4',
  city: '',
  state: 'TX',
  description: '',
  features: [] as string[],
  image: '',
};

function matchesPrice(listing: RvListing, filter: PriceFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'under30') return listing.price < 30000;
  if (filter === '30to75') return listing.price >= 30000 && listing.price < 75000;
  if (filter === '75to125') return listing.price >= 75000 && listing.price < 125000;
  return listing.price >= 125000;
}

export default function RvMarketplacePanel({
  user,
  displayHandle,
  onRequestSignIn,
}: RvMarketplacePanelProps) {
  const [view, setView] = useState<MarketView>('browse');
  const [listings, setListings] = useState<RvListing[]>([]);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [classFilter, setClassFilter] = useState<RvClass | ''>('');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [selected, setSelected] = useState<RvListing | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(() => {
    setListings(loadAllListings());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const myListings = useMemo(
    () => (user ? loadUserListingsOnly(user.id) : []),
    [user, listings]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listings.filter((l) => {
      if (stateFilter && l.state !== stateFilter) return false;
      if (classFilter && l.rvClass !== classFilter) return false;
      if (!matchesPrice(l, priceFilter)) return false;
      if (!q) return true;
      const haystack = [
        l.title,
        l.make,
        l.model,
        l.city,
        l.state,
        l.description,
        ...l.features,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [listings, search, stateFilter, classFilter, priceFilter]);

  const toggleFeature = (feature: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const openContact = (listing: RvListing) => {
    if (!user) {
      toast.info('Sign in to contact sellers.');
      onRequestSignIn();
      return;
    }
    setSelected(listing);
    setContactMessage(`Hi, I'm interested in your ${listing.year} ${listing.make} ${listing.model}. Is it still available?`);
    setShowContact(true);
  };

  const handleSendInterest = () => {
    if (!user || !selected) return;
    if (!contactMessage.trim()) return toast.error('Add a message for the seller.');
    saveListingInterest({
      listingId: selected.id,
      listingTitle: selected.title,
      message: contactMessage.trim(),
      contactEmail: user.email,
      userId: user.id,
      createdAt: new Date().toISOString(),
    });
    setShowContact(false);
    setContactMessage('');
    toast.success('Interest saved locally (demo) — no message was sent to the seller yet.');
  };

  const handleSubmitListing = () => {
    if (!user) {
      toast.info('Sign in to list your RV for sale.');
      onRequestSignIn();
      return;
    }
    const year = Number(form.year);
    const price = Number(form.price);
    const lengthFt = Number(form.lengthFt);
    const sleeps = Number(form.sleeps);
    const mileage = form.mileage ? Number(form.mileage) : undefined;

    if (!form.title.trim() || !form.make.trim() || !form.model.trim()) {
      return toast.error('Title, make, and model are required.');
    }
    if (!form.city.trim() || !form.state) {
      return toast.error('City and state are required.');
    }
    if (!Number.isFinite(year) || year < 1970 || year > new Date().getFullYear() + 1) {
      return toast.error('Enter a valid model year.');
    }
    if (!Number.isFinite(price) || price <= 0) {
      return toast.error('Enter a valid asking price.');
    }
    if (!Number.isFinite(lengthFt) || lengthFt <= 0) {
      return toast.error('Enter the RV length in feet.');
    }

    setSubmitting(true);
    const listing: RvListing = {
      id: `rv-user-${Date.now()}`,
      title: form.title.trim(),
      make: form.make.trim(),
      model: form.model.trim(),
      year,
      rvClass: form.rvClass,
      condition: form.condition,
      price,
      mileage,
      lengthFt,
      sleeps: Number.isFinite(sleeps) ? sleeps : 4,
      city: form.city.trim(),
      state: form.state,
      description: form.description.trim() || 'No additional description provided.',
      features: form.features,
      image: form.image.trim() || 'https://picsum.photos/id/1048/800/500',
      sellerName: displayHandle,
      sellerUserId: user.id,
      listedAt: new Date().toISOString(),
    };

    saveUserListing(listing);
    refresh();
    setForm(EMPTY_FORM);
    setView('mine');
    setSubmitting(false);
    toast.success('Listing saved locally (demo) — not published to a live marketplace yet.');
  };

  const handleRemoveListing = (listingId: string) => {
    removeUserListing(listingId);
    refresh();
    toast.success('Listing removed.');
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-1">
            <Caravan className="w-4 h-4" />
            RV Marketplace
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Buy &amp; sell RVs</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Browse rigs from the community, list yours for sale, and connect with sellers — demo listings for now.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-800/40 px-3 py-2 rounded-2xl max-w-md">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{DEMO_NOTICE_SHORT}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {([
          ['browse', 'Browse for sale'],
          ['sell', 'Sell your RV'],
          ['mine', `My listings (${myListings.length})`],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={`px-4 h-10 rounded-2xl text-sm font-semibold border transition ${
              view === id
                ? 'bg-amber-700 border-amber-600 text-white'
                : 'border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'browse' && (
        <>
          <div className="flex flex-col lg:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search make, model, city, features..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-600 transition pl-11 pr-4 h-12 rounded-3xl text-base outline-none"
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="lg:w-44 bg-slate-900 border border-slate-700 h-12 px-4 rounded-3xl outline-none"
            >
              <option value="">All states</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value as RvClass | '')}
              className="lg:w-52 bg-slate-900 border border-slate-700 h-12 px-4 rounded-3xl outline-none"
            >
              <option value="">All types</option>
              {(Object.entries(RV_CLASS_LABELS) as [RvClass, string][]).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>

          <div className="filter-scroll flex items-center bg-slate-900 border border-slate-700 rounded-3xl p-1 text-xs sm:text-sm mb-5 overflow-x-auto">
            {PRICE_FILTERS.map((tier) => (
              <button
                key={tier.value}
                type="button"
                onClick={() => setPriceFilter(tier.value)}
                className={`px-4 h-9 rounded-[20px] font-medium transition whitespace-nowrap ${
                  priceFilter === tier.value ? 'bg-amber-700 text-white' : 'hover:bg-slate-800'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <span className="font-semibold text-xl">{filtered.length}</span>
              <span className="text-slate-400 text-sm ml-1">RVs for sale</span>
            </div>
            <button
              type="button"
              onClick={() => setView('sell')}
              className="text-xs flex items-center gap-1 bg-amber-700 hover:bg-amber-600 px-3 py-1.5 rounded-2xl font-medium"
            >
              <Plus className="w-3 h-3" /> List yours
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400">
                No RVs match your filters.
              </div>
            ) : (
              filtered.map((listing) => (
                <article
                  key={listing.id}
                  className="rv-card bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden flex flex-col cursor-pointer"
                  onClick={() => setSelected(listing)}
                >
                  <div className="relative">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 text-[10px] font-semibold px-2 py-1 rounded-xl backdrop-blur">
                      {RV_CLASS_LABELS[listing.rvClass]}
                    </div>
                    <div className="absolute top-3 right-3 bg-amber-900/80 text-white text-xs font-bold px-2.5 py-1 rounded-xl backdrop-blur">
                      {formatRvPrice(listing.price)}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg leading-tight">{listing.title}</h3>
                    <p className="text-emerald-300 text-sm mt-1">
                      {listing.city}, {listing.state}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {listing.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <Ruler className="w-3 h-3" /> {listing.lengthFt}&apos;
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> Sleeps {listing.sleeps}
                      </span>
                      {listing.mileage != null && (
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3 h-3" /> {listing.mileage.toLocaleString()} mi
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {listing.features.slice(0, 3).map((f) => (
                        <span key={f} className="amenity-pill text-[10px] px-2 py-px">{f}</span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelected(listing)}
                        className="flex-1 bg-white text-slate-900 hover:bg-slate-100 font-semibold py-2 text-sm rounded-2xl"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => openContact(listing)}
                        className="flex-1 border border-amber-700 hover:bg-amber-950/30 font-medium py-2 text-sm rounded-2xl text-amber-300"
                      >
                        Contact
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </>
      )}

      {view === 'sell' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6">
          {!user && (
            <div className="mb-5 p-4 rounded-2xl border border-slate-700 bg-slate-950/80 text-sm text-slate-300">
              Sign in to list your RV. Listings are saved locally for demo purposes.
              <button
                type="button"
                onClick={onRequestSignIn}
                className="block mt-3 text-sky-400 font-semibold hover:text-sky-300"
              >
                Sign in →
              </button>
            </div>
          )}

          <h3 className="font-semibold text-lg mb-4">List your RV for sale</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Listing title (e.g. 2020 Winnebago View 24D)"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none focus:border-amber-600"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Make"
                value={form.make}
                onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
                className="bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none focus:border-amber-600"
              />
              <input
                type="text"
                placeholder="Model"
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                className="bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none focus:border-amber-600"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <input
                type="number"
                placeholder="Year"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                className="bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none focus:border-amber-600"
              />
              <input
                type="number"
                placeholder="Price ($)"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none focus:border-amber-600"
              />
              <input
                type="number"
                placeholder="Length (ft)"
                value={form.lengthFt}
                onChange={(e) => setForm((f) => ({ ...f, lengthFt: e.target.value }))}
                className="bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none focus:border-amber-600"
              />
              <input
                type="number"
                placeholder="Sleeps"
                value={form.sleeps}
                onChange={(e) => setForm((f) => ({ ...f, sleeps: e.target.value }))}
                className="bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none focus:border-amber-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.rvClass}
                onChange={(e) => setForm((f) => ({ ...f, rvClass: e.target.value as RvClass }))}
                className="bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none"
              >
                {(Object.entries(RV_CLASS_LABELS) as [RvClass, string][]).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
              <select
                value={form.condition}
                onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as RvCondition }))}
                className="bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none"
              >
                {(Object.entries(RV_CONDITION_LABELS) as [RvCondition, string][]).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="col-span-2 bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none focus:border-amber-600"
              />
              <select
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className="bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none"
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <input
              type="number"
              placeholder="Mileage (optional, motorized)"
              value={form.mileage}
              onChange={(e) => setForm((f) => ({ ...f, mileage: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none focus:border-amber-600"
            />
            <textarea
              placeholder="Description — upgrades, maintenance, why you're selling..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 px-4 py-3 rounded-2xl text-sm outline-none focus:border-amber-600 resize-y"
            />
            <input
              type="url"
              placeholder="Photo URL (optional)"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none focus:border-amber-600"
            />
            <div>
              <div className="text-xs font-medium text-slate-400 mb-2">Features</div>
              <div className="flex flex-wrap gap-2">
                {RV_FEATURE_OPTIONS.map((feature) => {
                  const active = form.features.includes(feature);
                  return (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      className={`filter-chip px-3 py-1 text-xs border rounded-2xl transition ${
                        active ? 'active border-amber-700' : 'border-slate-600'
                      }`}
                    >
                      {feature}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubmitListing}
              disabled={submitting}
              className="w-full bg-amber-700 hover:bg-amber-600 disabled:opacity-50 h-12 rounded-2xl font-semibold text-sm transition"
            >
              {submitting ? 'Saving...' : 'Publish listing (demo)'}
            </button>
          </div>
        </div>
      )}

      {view === 'mine' && (
        <div className="space-y-4">
          {!user ? (
            <div className="text-center py-12 text-slate-400">
              <p className="mb-4">Sign in to manage your listings.</p>
              <button
                type="button"
                onClick={onRequestSignIn}
                className="bg-white text-black px-6 py-2 rounded-3xl font-semibold text-sm"
              >
                Sign In
              </button>
            </div>
          ) : myListings.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="mb-4">You haven&apos;t listed an RV yet.</p>
              <button
                type="button"
                onClick={() => setView('sell')}
                className="bg-amber-700 hover:bg-amber-600 px-6 py-2 rounded-3xl font-semibold text-sm"
              >
                List your RV
              </button>
            </div>
          ) : (
            myListings.map((listing) => (
              <div
                key={listing.id}
                className="flex flex-col sm:flex-row gap-4 bg-slate-900 border border-slate-700 rounded-3xl p-4"
              >
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full sm:w-40 h-32 sm:h-28 object-cover rounded-2xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{listing.title}</h3>
                  <p className="text-amber-300 font-bold mt-1">{formatRvPrice(listing.price)}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Listed {formatListedDate(listing.listedAt)} · {listing.city}, {listing.state}
                  </p>
                </div>
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelected(listing)}
                    className="flex-1 sm:flex-none px-4 h-10 rounded-2xl border border-slate-600 text-sm hover:bg-slate-800"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveListing(listing.id)}
                    className="flex items-center justify-center gap-1 px-4 h-10 rounded-2xl border border-red-900/50 text-red-300 text-sm hover:bg-red-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selected && !showContact && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="modal bg-slate-900 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-700 max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selected.image} alt={selected.title} className="w-full h-52 sm:h-64 object-cover" />
            <div className="p-5 sm:p-6">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-3"
              >
                <ChevronLeft className="w-4 h-4" /> Back to listings
              </button>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold">{selected.title}</h3>
                  <p className="text-emerald-300 mt-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {selected.city}, {selected.state}
                  </p>
                </div>
                <div className="text-2xl font-bold text-amber-300">{formatRvPrice(selected.price)}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-sm">
                <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800">
                  <div className="text-slate-500 text-xs">Type</div>
                  <div className="font-medium">{RV_CLASS_LABELS[selected.rvClass]}</div>
                </div>
                <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800">
                  <div className="text-slate-500 text-xs">Year</div>
                  <div className="font-medium">{selected.year}</div>
                </div>
                <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800">
                  <div className="text-slate-500 text-xs">Condition</div>
                  <div className="font-medium">{RV_CONDITION_LABELS[selected.condition]}</div>
                </div>
                <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800">
                  <div className="text-slate-500 text-xs">Length</div>
                  <div className="font-medium">{selected.lengthFt}&apos;</div>
                </div>
              </div>

              <p className="mt-5 text-sm text-slate-300 leading-relaxed">{selected.description}</p>

              {selected.features.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selected.features.map((f) => (
                    <span key={f} className="amenity-pill text-xs px-2.5 py-1">{f}</span>
                  ))}
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-slate-800 text-sm text-slate-400">
                Seller: <span className="text-slate-200">{selected.sellerName}</span>
                <span className="mx-2">·</span>
                Listed {formatListedDate(selected.listedAt)}
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => openContact(selected)}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-600 h-11 rounded-2xl font-semibold text-sm"
                >
                  <MessageCircle className="w-4 h-4" /> Contact seller
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-5 border border-slate-600 h-11 rounded-2xl text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selected && showContact && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[115] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowContact(false)}
        >
          <div
            className="modal bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-700 p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg mb-1">Contact seller (demo)</h3>
            <p className="text-xs text-slate-400 mb-4">
              Your message is saved locally only — no email or notification is sent yet.
            </p>
            <div className="text-sm font-medium mb-2 truncate">{selected.title}</div>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 px-4 py-3 rounded-2xl text-sm outline-none focus:border-amber-600 resize-y"
            />
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowContact(false)}
                className="flex-1 border border-slate-600 h-11 rounded-2xl text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendInterest}
                className="flex-1 bg-amber-700 hover:bg-amber-600 h-11 rounded-2xl font-semibold text-sm"
              >
                Send interest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}