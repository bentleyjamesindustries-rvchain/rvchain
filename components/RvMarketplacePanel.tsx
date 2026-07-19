'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Caravan, Search, X, Plus, MapPin, Gauge, Ruler, Users,
  MessageCircle, Tag, ChevronLeft, Trash2, Info, Star, SlidersHorizontal,
  ShieldCheck, BadgeCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  RvListing,
  RvClass,
  RvCondition,
  RV_CLASS_LABELS,
  RV_CONDITION_LABELS,
  RV_FEATURE_OPTIONS,
  US_MARKET_STATES,
  US_STATE_COUNT,
  formatRvPrice,
  formatListedDate,
  formatRating,
  getStateName,
} from '@/lib/rvListings';
import {
  loadAllListings,
  saveUserListing,
  loadUserListingsOnly,
  removeUserListing,
  saveListingInterest,
} from '@/lib/rvMarketplaceStorage';
import { DEMO_NOTICE_SHORT } from '@/lib/demoMode';
import VerifiedBadge from '@/components/VerifiedBadge';
import {
  createRvCertificationRecord,
  getRvCertificationInfo,
} from '@/lib/rvCertification';
import { saveRvCertification } from '@/lib/rvCertificationStorage';
import {
  formatSellerProPrice,
  getRvchainSubscription,
  isRvchainSubscriber,
  isSellerFeaturedActive,
  purchaseFeaturedBoost,
  SELLER_FEATURED_BOOST_PRICE,
  SELLER_MAX_ACTIVE_LISTINGS,
  subscribeToRvchainServices,
  type SellerBillingInterval,
} from '@/lib/rvSubscriptionStorage';

type MarketView = 'browse' | 'sell' | 'mine';
type PriceFilter = 'all' | 'under30' | '30to75' | '75to125' | 'over125';
type RatingFilter = 'all' | '4' | '4.5';
type SortOption = 'rating' | 'newest' | 'price-asc' | 'price-desc';

const PRICE_FILTERS: { value: PriceFilter; label: string }[] = [
  { value: 'all', label: 'Any price' },
  { value: 'under30', label: 'Under $30k' },
  { value: '30to75', label: '$30k–75k' },
  { value: '75to125', label: '$75k–125k' },
  { value: 'over125', label: '$125k+' },
];

const RATING_FILTERS: { value: RatingFilter; label: string }[] = [
  { value: 'all', label: 'Any rating' },
  { value: '4', label: '4+ stars' },
  { value: '4.5', label: '4.5+ stars' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'rating', label: 'Highest rated' },
  { value: 'newest', label: 'Newest listed' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

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

function matchesRating(listing: RvListing, filter: RatingFilter): boolean {
  if (filter === 'all') return true;
  if (filter === '4') return listing.rating >= 4;
  return listing.rating >= 4.5;
}

function sortListings(list: RvListing[], sort: SortOption): RvListing[] {
  const copy = [...list];
  switch (sort) {
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    default:
      return copy.sort(
        (a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime()
      );
  }
}

function StarRating({
  value,
  count,
  size = 'sm',
  label,
}: {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  label?: string;
}) {
  const starSize = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  const textSize = size === 'md' ? 'text-sm' : 'text-xs';
  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <Star className={`${starSize} fill-amber-400 text-amber-400 shrink-0`} />
      <span className="font-semibold text-amber-100">{formatRating(value)}</span>
      {count != null && (
        <span className="text-slate-500">({count} review{count === 1 ? '' : 's'})</span>
      )}
      {label && <span className="text-slate-500 ml-0.5">{label}</span>}
    </div>
  );
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
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [subscribed, setSubscribed] = useState(false);
  const [certifyingId, setCertifyingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<RvListing | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [sellerInterval, setSellerInterval] = useState<SellerBillingInterval>('monthly');

  const refresh = useCallback(() => {
    setListings(loadAllListings());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setSubscribed(user ? isRvchainSubscriber(user.id) : false);
  }, [user]);

  const myListings = useMemo(
    () => (user ? loadUserListingsOnly(user.id) : []),
    [user, listings]
  );

  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of listings) {
      counts[l.state] = (counts[l.state] ?? 0) + 1;
    }
    return counts;
  }, [listings]);

  const stateOptions = useMemo(() => {
    return US_MARKET_STATES.map((s) => ({
      ...s,
      count: stateCounts[s.code] ?? 0,
    }));
  }, [stateCounts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matched = listings.filter((l) => {
      if (stateFilter && l.state !== stateFilter) return false;
      if (classFilter && l.rvClass !== classFilter) return false;
      if (!matchesPrice(l, priceFilter)) return false;
      if (!matchesRating(l, ratingFilter)) return false;
      if (certifiedOnly && !l.rvchainCertified) return false;
      if (!q) return true;
      const haystack = [
        l.title,
        l.make,
        l.model,
        l.city,
        l.state,
        getStateName(l.state),
        l.description,
        l.sellerName,
        ...l.features,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
    return sortListings(matched, sortBy);
  }, [listings, search, stateFilter, classFilter, priceFilter, ratingFilter, certifiedOnly, sortBy]);

  const activeFilterCount = [
    stateFilter,
    classFilter,
    priceFilter !== 'all',
    ratingFilter !== 'all',
    certifiedOnly,
    search.trim(),
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setStateFilter('');
    setClassFilter('');
    setPriceFilter('all');
    setRatingFilter('all');
    setCertifiedOnly(false);
    setSortBy('rating');
  };

  const handleSubscribe = () => {
    if (!user) {
      toast.info('Sign in to subscribe to Seller Pro.');
      onRequestSignIn();
      return;
    }
    subscribeToRvchainServices(user.id, sellerInterval);
    setSubscribed(true);
    toast.success(
      `Seller Pro activated (demo, ${formatSellerProPrice(sellerInterval)})! You can publish listings.`
    );
  };

  const handleFeaturedBoost = () => {
    if (!user) return onRequestSignIn();
    if (!isRvchainSubscriber(user.id)) {
      return toast.info('Seller Pro required before featured boost.');
    }
    purchaseFeaturedBoost(user.id);
    toast.success(`Featured boost started (demo, $${SELLER_FEATURED_BOOST_PRICE} / 7 days).`);
  };

  const handleCertifyListing = async (listing: RvListing) => {
    if (!user) {
      onRequestSignIn();
      return;
    }
    if (!isRvchainSubscriber(user.id)) {
      toast.info('Seller Pro is required to certify listings.');
      return;
    }
    if (listing.rvchainCertified) {
      return toast.info('This listing is already RVCHAIN certified.');
    }
    if (listing.sellerUserId && listing.sellerUserId !== user.id) {
      return toast.error('You can only certify your own listings.');
    }

    setCertifyingId(listing.id);
    const toastId = toast.loading('Certifying listing…');
    try {
      const certifiedBy = user.email ?? user.username ?? displayHandle;
      const record = createRvCertificationRecord(listing, certifiedBy);
      saveRvCertification(record);
      refresh();
      toast.dismiss(toastId);
      toast.success('RVCHAIN Certified!');
    } catch {
      toast.dismiss(toastId);
      toast.error('Certification failed. Try again.');
    } finally {
      setCertifyingId(null);
    }
  };

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
    if (!isRvchainSubscriber(user.id)) {
      toast.info('Seller Pro is required to publish listings — no free listings.');
      setView('sell');
      return;
    }
    if (myListings.length >= SELLER_MAX_ACTIVE_LISTINGS) {
      return toast.error(`Seller Pro allows up to ${SELLER_MAX_ACTIVE_LISTINGS} active listings.`);
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
      rating: 0,
      reviewCount: 0,
      sellerRating: 5,
      sellerReviewCount: 0,
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
      {/* Hero */}
      <div className="rv-market-hero relative overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 p-5 sm:p-8 mb-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,191,36,0.12),_transparent_55%)]" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="section-intro">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
              <Caravan className="w-4 h-4" />
              RV Marketplace
            </div>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight">Find your next rig</h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl">
              Search by state, compare ratings, and look for the RVCHAIN Certified badge — moderator-reviewed seller trust.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-amber-200/90 bg-black/30 border border-amber-700/30 px-3 py-2 rounded-2xl max-w-sm backdrop-blur">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>{DEMO_NOTICE_SHORT}</span>
          </div>
        </div>

        {view === 'browse' && (
          <div className="relative mt-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search make, model, city, or features..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-600 focus:border-amber-500 transition pl-11 pr-10 h-12 sm:h-14 rounded-2xl text-base outline-none shadow-lg"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="sm:w-56 bg-slate-950/90 border border-slate-600 focus:border-amber-500 h-12 sm:h-14 px-4 rounded-2xl outline-none text-sm font-medium shadow-lg"
              aria-label="Filter by state"
            >
              <option value="">All states — {US_STATE_COUNT} available ({listings.length} listings)</option>
              {stateOptions.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code}) — {s.count} listing{s.count === 1 ? '' : 's'}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="sm:w-52 bg-slate-950/90 border border-slate-600 focus:border-amber-500 h-12 sm:h-14 px-4 rounded-2xl outline-none text-sm font-medium shadow-lg"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {([
          ['browse', 'Browse'],
          ['sell', 'Sell'],
          ['mine', `My listings (${myListings.length})`],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={`px-4 h-10 rounded-2xl text-sm font-semibold border transition ${
              view === id
                ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-900/30'
                : 'border-slate-700 text-slate-300 hover:border-slate-500 bg-slate-900/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'browse' && (
        <>
          {/* RVCHAIN Certification promo */}
          <div className="mb-5 p-4 sm:p-5 rounded-3xl border border-emerald-800/40 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/80 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-emerald-900/50 border border-emerald-700/50 flex items-center justify-center shrink-0">
                <BadgeCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-200">Seller Pro — required to list</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed max-w-2xl">
                  No free listings. Seller Pro ({formatSellerProPrice('monthly')} or {formatSellerProPrice('annual')})
                  unlocks publishing, certification badges, and optional featured boosts. Browse stays free.
                </p>
              </div>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-2 text-sm text-emerald-300 font-semibold shrink-0 bg-emerald-950/50 border border-emerald-700/40 px-4 py-2.5 rounded-2xl">
                <ShieldCheck className="w-4 h-4" />
                Seller Pro active
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setView('sell')}
                className="shrink-0 bg-amber-600 hover:bg-amber-500 px-5 h-11 rounded-2xl font-semibold text-sm transition"
              >
                Get Seller Pro
              </button>
            )}
          </div>

          {/* Filters row */}
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="lg:w-56 bg-slate-900 border border-slate-700 h-11 px-4 rounded-2xl outline-none text-sm"
              aria-label="Filter listings by state"
            >
              <option value="">All {US_STATE_COUNT} states</option>
              {stateOptions.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code}) — {s.count}
                </option>
              ))}
            </select>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value as RvClass | '')}
              className="lg:w-52 bg-slate-900 border border-slate-700 h-11 px-4 rounded-2xl outline-none text-sm"
            >
              <option value="">All RV types</option>
              {(Object.entries(RV_CLASS_LABELS) as [RvClass, string][]).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>

            <div className="filter-scroll flex items-center bg-slate-900 border border-slate-700 rounded-2xl p-1 text-xs sm:text-sm overflow-x-auto flex-1">
              {PRICE_FILTERS.map((tier) => (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => setPriceFilter(tier.value)}
                  className={`px-3.5 h-9 rounded-[18px] font-medium transition whitespace-nowrap ${
                    priceFilter === tier.value ? 'bg-amber-700 text-white' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-scroll flex items-center gap-2 mb-5 overflow-x-auto pb-1">
            <span className="text-xs text-slate-500 font-medium shrink-0 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Rating
            </span>
            {RATING_FILTERS.map((tier) => (
              <button
                key={tier.value}
                type="button"
                onClick={() => setRatingFilter(tier.value)}
                className={`flex items-center gap-1.5 px-3.5 h-9 rounded-2xl text-sm font-medium border transition whitespace-nowrap shrink-0 ${
                  ratingFilter === tier.value
                    ? 'bg-amber-700/90 border-amber-600 text-white'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {tier.value !== 'all' && <Star className="w-3.5 h-3.5 fill-current" />}
                {tier.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCertifiedOnly((v) => !v)}
              className={`flex items-center gap-1.5 px-3.5 h-9 rounded-2xl text-sm font-medium border transition whitespace-nowrap shrink-0 ${
                certifiedOnly
                  ? 'bg-emerald-700/90 border-emerald-600 text-white'
                  : 'border-slate-700 text-slate-300 hover:border-emerald-700/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              RVCHAIN Certified
            </button>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium shrink-0 ml-1"
              >
                Clear filters ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <span className="font-semibold text-xl">{filtered.length}</span>
              <span className="text-slate-400 text-sm ml-1">
                RVs{stateFilter ? ` in ${getStateName(stateFilter)}` : ''}
                {certifiedOnly ? ' · certified only' : ''}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setView('sell')}
              className="text-xs flex items-center gap-1 bg-amber-600 hover:bg-amber-500 px-3 py-1.5 rounded-2xl font-semibold shadow-sm"
            >
              <Plus className="w-3 h-3" /> List yours
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-16 text-slate-400 rounded-3xl border border-dashed border-slate-700">
                <Caravan className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                <p>No RVs match your filters.</p>
                <button type="button" onClick={clearFilters} className="mt-3 text-amber-400 font-medium hover:text-amber-300">
                  Clear all filters
                </button>
              </div>
            ) : (
              filtered.map((listing) => (
                <article
                  key={listing.id}
                  className="rv-market-card group bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden flex flex-col cursor-pointer hover:border-amber-700/50 transition-all duration-200 hover:shadow-xl hover:shadow-black/20"
                  onClick={() => setSelected(listing)}
                >
                  <div className="relative">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                      <span className="bg-black/60 text-[10px] font-bold px-2.5 py-1 rounded-xl backdrop-blur border border-white/10">
                        {RV_CLASS_LABELS[listing.rvClass]}
                      </span>
                      {listing.rvchainCertified && (
                        <VerifiedBadge
                          verifiedBy={getRvCertificationInfo(listing)?.certifiedBy}
                          verifiedAt={getRvCertificationInfo(listing)?.certifiedAt}
                          size="sm"
                        />
                      )}
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-xl backdrop-blur border border-white/10">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {formatRating(listing.rating)}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <div className="text-xl font-bold text-white">{formatRvPrice(listing.price)}</div>
                        <div className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {listing.city}, {listing.state}
                        </div>
                      </div>
                      {listing.reviewCount > 0 ? (
                        <span className="text-[10px] text-slate-400 bg-black/40 px-2 py-1 rounded-lg backdrop-blur">
                          {listing.reviewCount} reviews
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-300/80 bg-black/40 px-2 py-1 rounded-lg backdrop-blur">
                          New listing
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-base leading-snug line-clamp-2">{listing.title}</h3>
                    <div className="mt-2">
                      {listing.reviewCount > 0 ? (
                        <StarRating value={listing.rating} count={listing.reviewCount} />
                      ) : (
                        <span className="text-xs text-slate-500">No reviews yet</span>
                      )}
                    </div>
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
                    <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{listing.sellerName}</span>
                      <span className="flex items-center gap-0.5 text-amber-400/80">
                        <Star className="w-3 h-3 fill-current" />
                        {formatRating(listing.sellerRating)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelected(listing)}
                        className="flex-1 bg-white text-slate-900 hover:bg-slate-100 font-semibold py-2.5 text-sm rounded-2xl"
                      >
                        View listing
                      </button>
                      <button
                        type="button"
                        onClick={() => openContact(listing)}
                        className="flex-1 border border-amber-700/80 hover:bg-amber-950/40 font-medium py-2.5 text-sm rounded-2xl text-amber-300"
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
              Sign in, then subscribe to Seller Pro to publish listings. There is no free listing tier.
              <button
                type="button"
                onClick={onRequestSignIn}
                className="block mt-3 text-sky-400 font-semibold hover:text-sky-300"
              >
                Sign in →
              </button>
            </div>
          )}

          {user && !subscribed && (
            <div className="mb-5 p-5 rounded-2xl border border-amber-700/40 bg-amber-950/20 space-y-4">
              <div>
                <h3 className="font-semibold text-amber-100">Seller Pro required</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Publish up to {SELLER_MAX_ACTIVE_LISTINGS} listings, certify for trust badges, and buy
                  optional featured boosts. No free single listing — keeps the market for serious sellers.
                </p>
              </div>
              <div className="flex gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 w-fit">
                <button
                  type="button"
                  onClick={() => setSellerInterval('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    sellerInterval === 'monthly' ? 'bg-amber-700 text-white' : 'text-slate-400'
                  }`}
                >
                  {formatSellerProPrice('monthly')}
                </button>
                <button
                  type="button"
                  onClick={() => setSellerInterval('annual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    sellerInterval === 'annual' ? 'bg-amber-700 text-white' : 'text-slate-400'
                  }`}
                >
                  {formatSellerProPrice('annual')}
                </button>
              </div>
              <button
                type="button"
                onClick={handleSubscribe}
                className="w-full h-11 rounded-2xl bg-amber-600 hover:bg-amber-500 font-semibold text-sm"
              >
                Activate Seller Pro (demo) — {formatSellerProPrice(sellerInterval)}
              </button>
              <p className="text-[10px] text-slate-500">{DEMO_NOTICE_SHORT}</p>
            </div>
          )}

          <h3 className="font-semibold text-lg mb-4">List your RV for sale</h3>
          <div className={`space-y-4 ${user && !subscribed ? 'opacity-40 pointer-events-none select-none' : ''}`}>
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
                {US_MARKET_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.code} — {s.name}</option>
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
              disabled={submitting || !user || !subscribed}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 h-12 rounded-2xl font-semibold text-sm transition"
            >
              {submitting
                ? 'Saving...'
                : !subscribed
                  ? 'Seller Pro required to publish'
                  : 'Publish listing (demo)'}
            </button>
          </div>
        </div>
      )}

      {view === 'mine' && (
        <div className="space-y-4">
          {user && !subscribed && (
            <div className="p-4 rounded-3xl border border-amber-800/40 bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-amber-200 text-sm">Seller Pro required to list</p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatSellerProPrice('monthly')} · no free listings · certify &amp; feature when active
                </p>
              </div>
              <button
                type="button"
                onClick={() => setView('sell')}
                className="shrink-0 bg-amber-600 hover:bg-amber-500 px-5 h-10 rounded-2xl font-semibold text-sm"
              >
                Get Seller Pro
              </button>
            </div>
          )}
          {user && subscribed && (
            <div className="p-3 rounded-2xl border border-emerald-700/40 bg-emerald-950/30 text-sm text-emerald-300 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  Seller Pro since{' '}
                  {getRvchainSubscription(user.id)?.subscribedAt
                    ? formatListedDate(getRvchainSubscription(user.id)!.subscribedAt)
                    : 'today'}
                  {isSellerFeaturedActive(user.id) ? ' · Featured boost active' : ''}
                </span>
              </div>
              {!isSellerFeaturedActive(user.id) && (
                <button
                  type="button"
                  onClick={handleFeaturedBoost}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-xl border border-amber-600/50 text-amber-200 hover:bg-amber-950/40 font-semibold"
                >
                  Featured boost ${SELLER_FEATURED_BOOST_PRICE}/7 days (demo)
                </button>
              )}
            </div>
          )}
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
                className="bg-amber-600 hover:bg-amber-500 px-6 py-2 rounded-3xl font-semibold text-sm"
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
                  {listing.reviewCount === 0 && (
                    <p className="text-[10px] text-slate-500 mt-1">New listing — no reviews yet</p>
                  )}
                </div>
                <div className="flex sm:flex-col gap-2 shrink-0">
                  {listing.rvchainCertified ? (
                    <VerifiedBadge
                      verifiedBy={getRvCertificationInfo(listing)?.certifiedBy}
                      verifiedAt={getRvCertificationInfo(listing)?.certifiedAt}
                      size="sm"
                    />
                  ) : subscribed ? (
                    <button
                      type="button"
                      onClick={() => handleCertifyListing(listing)}
                      disabled={certifyingId === listing.id}
                      className="flex items-center justify-center gap-1 px-4 h-10 rounded-2xl border border-emerald-700/60 text-emerald-300 text-sm hover:bg-emerald-950/40 disabled:opacity-50"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {certifyingId === listing.id ? 'Certifying…' : 'Certify listing'}
                    </button>
                  ) : null}
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
            <div className="relative">
              <img src={selected.image} alt={selected.title} className="w-full h-52 sm:h-64 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                <div className="bg-black/50 backdrop-blur px-3 py-2 rounded-2xl border border-white/10">
                  <StarRating value={selected.rating} count={selected.reviewCount} size="md" />
                </div>
                <div className="text-2xl font-bold text-white bg-black/50 backdrop-blur px-3 py-2 rounded-2xl border border-white/10">
                  {formatRvPrice(selected.price)}
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-3"
              >
                <ChevronLeft className="w-4 h-4" /> Back to listings
              </button>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold">{selected.title}</h3>
                <p className="text-emerald-300 mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {selected.city}, {selected.state} · {getStateName(selected.state)}
                </p>
                {selected.rvchainCertified && (
                  <div className="mt-3">
                    <VerifiedBadge
                      verifiedBy={getRvCertificationInfo(selected)?.certifiedBy}
                      verifiedAt={getRvCertificationInfo(selected)?.certifiedAt}
                      size="md"
                    />
                  </div>
                )}
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

              <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-500 mb-2">Seller</div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-200">{selected.sellerName}</span>
                  <StarRating
                    value={selected.sellerRating}
                    count={selected.sellerReviewCount}
                    label="seller score"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Listed {formatListedDate(selected.listedAt)}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => openContact(selected)}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 h-11 rounded-2xl font-semibold text-sm"
                >
                  <MessageCircle className="w-4 h-4" /> Contact seller
                </button>
                {user &&
                  selected.sellerUserId === user.id &&
                  subscribed &&
                  !selected.rvchainCertified && (
                    <button
                      type="button"
                      onClick={() => handleCertifyListing(selected)}
                      disabled={certifyingId === selected.id}
                      className="flex-1 flex items-center justify-center gap-2 border border-emerald-600 hover:bg-emerald-950/40 text-emerald-300 h-11 rounded-2xl font-semibold text-sm disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {certifyingId === selected.id ? 'Certifying…' : 'Get RVCHAIN Certified'}
                    </button>
                  )}
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
                className="flex-1 bg-amber-600 hover:bg-amber-500 h-11 rounded-2xl font-semibold text-sm"
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