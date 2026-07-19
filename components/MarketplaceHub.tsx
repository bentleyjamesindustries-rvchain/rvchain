'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Caravan, Search, X, MapPin, MessageCircle, Trash2, Info, Package, Wrench, ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  RvListing,
  RvClass,
  RvCondition,
  RV_CLASS_LABELS,
  US_MARKET_STATES,
  formatRvPrice,
} from '@/lib/rvListings';
import {
  loadAllListings,
  saveUserListing,
  loadUserListingsOnly,
  removeUserListing,
  saveListingInterest,
  markListingSold,
} from '@/lib/rvMarketplaceStorage';
import {
  GearListing,
  GearCategoryId,
  GearCondition,
  GEAR_CATEGORY_LABELS,
  GEAR_CONDITION_LABELS,
  formatGearPrice,
} from '@/lib/gearListings';
import {
  loadAllGearListings,
  saveUserGearListing,
  loadUserGearListingsOnly,
  removeUserGearListing,
  markGearListingSold,
} from '@/lib/gearMarketplaceStorage';
import {
  PartsListing,
  PartsCategoryId,
  PartsCondition,
  PARTS_CATEGORY_LABELS,
  PARTS_CONDITION_LABELS,
  formatPartsPrice,
} from '@/lib/partsListings';
import {
  loadAllPartsListings,
  saveUserPartsListing,
  loadUserPartsListingsOnly,
  removeUserPartsListing,
  markPartsListingSold,
} from '@/lib/partsMarketplaceStorage';
import {
  canPublishAnotherListing,
  canPublishListing,
  consumeListingCredit,
  countUnusedListingCredits,
  getPublishAccess,
  listingExpiresAt,
  purchaseSingleListingCredit,
  singleListingPrice,
  SINGLE_LISTING_DAYS,
} from '@/lib/sellerListingAccess';
import {
  formatFeePercent,
  formatSellerPayout,
  quoteMarketplaceFee,
  type MarketplaceItemType,
} from '@/lib/marketplaceFees';
import { createDemoMarketplaceSale } from '@/lib/marketplaceSales';
import {
  formatSellerProPrice,
  isRvchainSubscriber,
  subscribeToRvchainServices,
  type SellerBillingInterval,
} from '@/lib/rvSubscriptionStorage';
import { DEMO_NOTICE_SHORT } from '@/lib/demoMode';
import { awardRoadCrewForUser } from '@/lib/roadCrew';
import { getMembershipPlanId } from '@/lib/membershipSubscription';
import MarketplaceDisclosure from './MarketplaceDisclosure';
import MarketplaceCheckoutModal from './MarketplaceCheckoutModal';

type HubView = 'rvs' | 'gear' | 'parts' | 'sell' | 'mine';
type SellKind = MarketplaceItemType;

interface Props {
  user: { id: string; email?: string; username?: string } | null;
  displayHandle: string;
  onRequestSignIn: () => void;
}

const EMPTY_RV = {
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
  image: '',
};

const EMPTY_GEAR = {
  title: '',
  gearCategory: 'other' as GearCategoryId,
  brand: '',
  condition: 'good' as GearCondition,
  price: '',
  quantity: '1',
  city: '',
  state: 'TX',
  description: '',
  image: '',
};

const EMPTY_PARTS = {
  title: '',
  partsCategory: 'other' as PartsCategoryId,
  brand: '',
  condition: 'good' as PartsCondition,
  price: '',
  quantity: '1',
  city: '',
  state: 'TX',
  description: '',
  image: '',
};

type CheckoutTarget = {
  itemType: MarketplaceItemType;
  id: string;
  title: string;
  price: number;
  sellerUserId?: string;
};

export default function MarketplaceHub({ user, displayHandle, onRequestSignIn }: Props) {
  const [view, setView] = useState<HubView>('rvs');
  const [sellKind, setSellKind] = useState<SellKind>('rv');
  const [rvs, setRvs] = useState<RvListing[]>([]);
  const [gear, setGear] = useState<GearListing[]>([]);
  const [parts, setParts] = useState<PartsListing[]>([]);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [credits, setCredits] = useState({ rv: 0, gear: 0, parts: 0 });
  const [sellerInterval, setSellerInterval] = useState<SellerBillingInterval>('monthly');
  const [rvForm, setRvForm] = useState(EMPTY_RV);
  const [gearForm, setGearForm] = useState(EMPTY_GEAR);
  const [partsForm, setPartsForm] = useState(EMPTY_PARTS);
  const [sellerAgreeOwn, setSellerAgreeOwn] = useState(false);
  const [sellerAgreeFee, setSellerAgreeFee] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutTarget | null>(null);
  const [detail, setDetail] = useState<
    (CheckoutTarget & { description: string; meta: string }) | null
  >(null);

  const refresh = useCallback(() => {
    setRvs(loadAllListings());
    setGear(loadAllGearListings());
    setParts(loadAllPartsListings());
    if (user) {
      setSubscribed(isRvchainSubscriber(user.id));
      setCredits({
        rv: countUnusedListingCredits(user.id, 'rv'),
        gear: countUnusedListingCredits(user.id, 'gear'),
        parts: countUnusedListingCredits(user.id, 'parts'),
      });
    } else {
      setSubscribed(false);
      setCredits({ rv: 0, gear: 0, parts: 0 });
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const myRvs = useMemo(() => (user ? loadUserListingsOnly(user.id) : []), [user, rvs]);
  const myGear = useMemo(() => (user ? loadUserGearListingsOnly(user.id) : []), [user, gear]);
  const myParts = useMemo(() => (user ? loadUserPartsListingsOnly(user.id) : []), [user, parts]);

  const filterActive = <
    T extends { status?: string; title: string; city: string; state: string; description: string },
  >(
    list: T[]
  ) => {
    const q = search.trim().toLowerCase();
    return list.filter((l) => {
      if ((l.status ?? 'active') === 'sold' || (l.status ?? 'active') === 'expired') return false;
      if (stateFilter && l.state !== stateFilter) return false;
      if (!q) return true;
      return `${l.title} ${l.city} ${l.state} ${l.description}`.toLowerCase().includes(q);
    });
  };

  const filteredRvs = useMemo(() => filterActive(rvs), [rvs, search, stateFilter]);
  const filteredGear = useMemo(() => filterActive(gear), [gear, search, stateFilter]);
  const filteredParts = useMemo(() => filterActive(parts), [parts, search, stateFilter]);

  const canPub = (t: MarketplaceItemType) => (user ? canPublishListing(user.id, t) : false);

  const buyCredit = (t: MarketplaceItemType) => {
    if (!user) return onRequestSignIn();
    purchaseSingleListingCredit(user.id, t);
    refresh();
    toast.success(
      `${t === 'rv' ? 'RV' : t === 'gear' ? 'Gear' : 'Parts'} listing credit (demo $${singleListingPrice(t)}) — ${SINGLE_LISTING_DAYS} days when published.`
    );
  };

  const buyPro = () => {
    if (!user) return onRequestSignIn();
    subscribeToRvchainServices(user.id, sellerInterval);
    refresh();
    toast.success(`Seller Pro (demo ${formatSellerProPrice(sellerInterval)}) activated.`);
  };

  const handleCheckoutConfirm = () => {
    if (!user || !checkout?.sellerUserId) return;
    if (checkout.sellerUserId === user.id) {
      toast.error('You cannot buy your own listing.');
      return;
    }
    const sale = createDemoMarketplaceSale({
      listingId: checkout.id,
      listingTitle: checkout.title,
      itemType: checkout.itemType,
      buyerUserId: user.id,
      sellerUserId: checkout.sellerUserId,
      grossPrice: checkout.price,
    });
    if (checkout.itemType === 'rv') markListingSold(checkout.id, sale.id);
    if (checkout.itemType === 'gear') markGearListingSold(checkout.id, sale.id);
    if (checkout.itemType === 'parts') markPartsListingSold(checkout.id, sale.id);
    setCheckout(null);
    setDetail(null);
    refresh();
    toast.success(
      `Demo purchase complete (${formatFeePercent(sale.feePercent)} marketplace fee applied).`
    );
    const pts = awardRoadCrewForUser(
      user.id,
      getMembershipPlanId(user.id),
      'market_sale',
      checkout.title
    );
    if (pts > 0) toast.message(`Road Crew +${pts} pts`);
  };

  const publishRv = () => {
    if (!user) return onRequestSignIn();
    const gate = canPublishAnotherListing(user.id, 'rv');
    if (!gate.ok) return toast.info(gate.error);
    if (!sellerAgreeOwn || !sellerAgreeFee) return toast.error('Confirm ownership and fee terms.');
    const price = Number(rvForm.price);
    const year = Number(rvForm.year);
    const lengthFt = Number(rvForm.lengthFt);
    if (!rvForm.title.trim() || !rvForm.make.trim() || !rvForm.model.trim())
      return toast.error('Title, make, and model required.');
    if (!Number.isFinite(price) || price <= 0) return toast.error('Valid price required.');
    if (!Number.isFinite(year) || !Number.isFinite(lengthFt) || lengthFt <= 0)
      return toast.error('Valid year and length required.');

    setSubmitting(true);
    const access = getPublishAccess(user.id, 'rv');
    const id = `rv-user-${Date.now()}`;
    let expiresAt: string | null = null;
    let listingAccess: 'single' | 'seller-pro' = 'seller-pro';
    if (access === 'single-credit') {
      const c = consumeListingCredit(user.id, id, 'rv');
      if (!c) {
        setSubmitting(false);
        return toast.error('No RV listing credit.');
      }
      listingAccess = 'single';
      expiresAt = listingExpiresAt(new Date(), c.durationDays);
    }
    saveUserListing({
      id,
      title: rvForm.title.trim(),
      make: rvForm.make.trim(),
      model: rvForm.model.trim(),
      year,
      rvClass: rvForm.rvClass,
      condition: rvForm.condition,
      price,
      mileage: rvForm.mileage ? Number(rvForm.mileage) : undefined,
      lengthFt,
      sleeps: Number(rvForm.sleeps) || 4,
      city: rvForm.city.trim() || 'Unknown',
      state: rvForm.state,
      description: rvForm.description.trim() || 'No description.',
      features: [],
      image: rvForm.image.trim() || '/marketplace/rv-travel-trailer.jpg',
      sellerName: displayHandle,
      sellerUserId: user.id,
      listedAt: new Date().toISOString(),
      rating: 0,
      reviewCount: 0,
      sellerRating: 5,
      sellerReviewCount: 0,
      listingAccess,
      expiresAt,
      status: 'active',
    });
    const q = quoteMarketplaceFee(price, 'rv');
    const listedTitle = rvForm.title.trim();
    setRvForm(EMPTY_RV);
    setSellerAgreeFee(false);
    setSellerAgreeOwn(false);
    setSubmitting(false);
    refresh();
    setView('mine');
    toast.success(
      `RV listed (demo). At list price you receive ${formatSellerPayout(q.sellerNet)} (${formatFeePercent(q.feePercent)}).`
    );
    const pts = awardRoadCrewForUser(user.id, getMembershipPlanId(user.id), 'market_list', listedTitle);
    if (pts > 0) toast.message(`Road Crew +${pts} pts`);
  };

  const publishGear = () => {
    if (!user) return onRequestSignIn();
    const gate = canPublishAnotherListing(user.id, 'gear');
    if (!gate.ok) return toast.info(gate.error);
    if (!sellerAgreeOwn || !sellerAgreeFee) return toast.error('Confirm ownership and fee terms.');
    const price = Number(gearForm.price);
    if (!gearForm.title.trim()) return toast.error('Title required.');
    if (!Number.isFinite(price) || price <= 0) return toast.error('Valid price required.');

    setSubmitting(true);
    const access = getPublishAccess(user.id, 'gear');
    const id = `gear-user-${Date.now()}`;
    let expiresAt: string | null = null;
    let listingAccess: 'single' | 'seller-pro' = 'seller-pro';
    if (access === 'single-credit') {
      const c = consumeListingCredit(user.id, id, 'gear');
      if (!c) {
        setSubmitting(false);
        return toast.error('No gear listing credit.');
      }
      listingAccess = 'single';
      expiresAt = listingExpiresAt(new Date(), c.durationDays);
    }
    saveUserGearListing({
      id,
      title: gearForm.title.trim(),
      gearCategory: gearForm.gearCategory,
      brand: gearForm.brand.trim() || undefined,
      condition: gearForm.condition,
      price,
      quantity: Number(gearForm.quantity) || 1,
      city: gearForm.city.trim() || 'Unknown',
      state: gearForm.state,
      description: gearForm.description.trim() || 'No description.',
      image: gearForm.image.trim() || '/marketplace/gear-cooler.jpg',
      sellerName: displayHandle,
      sellerUserId: user.id,
      listedAt: new Date().toISOString(),
      listingAccess,
      expiresAt,
      status: 'active',
    });
    const q = quoteMarketplaceFee(price, 'gear');
    const listedTitle = gearForm.title.trim();
    setGearForm(EMPTY_GEAR);
    setSellerAgreeFee(false);
    setSellerAgreeOwn(false);
    setSubmitting(false);
    refresh();
    setView('mine');
    toast.success(
      `Gear listed (demo). At list price you receive ${formatSellerPayout(q.sellerNet)} (${formatFeePercent(q.feePercent)}).`
    );
    const pts = awardRoadCrewForUser(user.id, getMembershipPlanId(user.id), 'market_list', listedTitle);
    if (pts > 0) toast.message(`Road Crew +${pts} pts`);
  };

  const publishParts = () => {
    if (!user) return onRequestSignIn();
    const gate = canPublishAnotherListing(user.id, 'parts');
    if (!gate.ok) return toast.info(gate.error);
    if (!sellerAgreeOwn || !sellerAgreeFee) return toast.error('Confirm ownership and fee terms.');
    const price = Number(partsForm.price);
    if (!partsForm.title.trim()) return toast.error('Title required.');
    if (!Number.isFinite(price) || price <= 0) return toast.error('Valid price required.');

    setSubmitting(true);
    const access = getPublishAccess(user.id, 'parts');
    const id = `parts-user-${Date.now()}`;
    let expiresAt: string | null = null;
    let listingAccess: 'single' | 'seller-pro' = 'seller-pro';
    if (access === 'single-credit') {
      const c = consumeListingCredit(user.id, id, 'parts');
      if (!c) {
        setSubmitting(false);
        return toast.error('No parts listing credit.');
      }
      listingAccess = 'single';
      expiresAt = listingExpiresAt(new Date(), c.durationDays);
    }
    saveUserPartsListing({
      id,
      title: partsForm.title.trim(),
      partsCategory: partsForm.partsCategory,
      brand: partsForm.brand.trim() || undefined,
      condition: partsForm.condition,
      price,
      quantity: Number(partsForm.quantity) || 1,
      city: partsForm.city.trim() || 'Unknown',
      state: partsForm.state,
      description:
        partsForm.description.trim() || 'No description. Fitment is buyer responsibility.',
      image: partsForm.image.trim() || '/marketplace/parts-hitch.jpg',
      sellerName: displayHandle,
      sellerUserId: user.id,
      listedAt: new Date().toISOString(),
      listingAccess,
      expiresAt,
      status: 'active',
    });
    const q = quoteMarketplaceFee(price, 'parts');
    const listedTitle = partsForm.title.trim();
    setPartsForm(EMPTY_PARTS);
    setSellerAgreeFee(false);
    setSellerAgreeOwn(false);
    setSubmitting(false);
    refresh();
    setView('mine');
    toast.success(
      `Parts listed (demo). At list price you receive ${formatSellerPayout(q.sellerNet)} (${formatFeePercent(q.feePercent)}).`
    );
    const pts = awardRoadCrewForUser(user.id, getMembershipPlanId(user.id), 'market_list', listedTitle);
    if (pts > 0) toast.message(`Road Crew +${pts} pts`);
  };

  const openBuy = (t: CheckoutTarget) => {
    if (!user) {
      toast.info('Sign in to buy through rvchain.');
      onRequestSignIn();
      return;
    }
    setCheckout(t);
  };

  /** Seller-only payout estimate — never show to buyers/public browse */
  const sellerPayoutPreview = (price: number, type: MarketplaceItemType) => {
    if (!Number.isFinite(price) || price <= 0) return null;
    const q = quoteMarketplaceFee(price, type);
    return (
      <div className="rounded-2xl border border-emerald-800/40 bg-emerald-950/20 p-3 text-sm">
        <div className="text-xs text-slate-400">
          Your marketplace fee rate{' '}
          <strong className="text-slate-200">{formatFeePercent(q.feePercent)}</strong>
        </div>
        <div className="text-emerald-300 font-bold text-lg">
          You&apos;ll receive: {formatSellerPayout(q.sellerNet)}
        </div>
        <p className="text-[10px] text-slate-500 mt-1">Only you see this estimate as the seller.</p>
      </div>
    );
  };

  const sellerChecks = (
    <>
      <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={sellerAgreeOwn}
          onChange={(e) => setSellerAgreeOwn(e.target.checked)}
          className="mt-0.5 rounded border-slate-600"
        />
        <span>I own this item or am authorized to sell it; listing is accurate.</span>
      </label>
      <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={sellerAgreeFee}
          onChange={(e) => setSellerAgreeFee(e.target.checked)}
          className="mt-0.5 rounded border-slate-600"
        />
        <span>
          Sales through rvchain use a marketplace fee %; I will see the rate and what I receive before
          close.
        </span>
      </label>
    </>
  );

  const card = (
    l: {
      id: string;
      title: string;
      price: number;
      city: string;
      state: string;
      image: string;
      sellerUserId?: string;
      description: string;
    },
    itemType: MarketplaceItemType,
    badge: string,
    meta: string,
    priceFmt: string
  ) => (
    <article
      key={l.id}
      className="rounded-3xl border border-slate-700 bg-slate-900/80 overflow-hidden flex flex-col"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={l.image} alt="" className="h-40 w-full object-cover" />
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-[10px] text-slate-500 uppercase font-semibold">{badge}</div>
        <h3 className="font-semibold text-slate-100 line-clamp-2">{l.title}</h3>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3" /> {l.city}, {l.state}
        </p>
        <div className="text-lg font-bold text-amber-300 mt-2">{priceFmt}</div>
        <div className="mt-auto pt-3 flex gap-2">
          <button
            type="button"
            onClick={() =>
              setDetail({
                itemType,
                id: l.id,
                title: l.title,
                price: l.price,
                sellerUserId: l.sellerUserId,
                description: l.description,
                meta,
              })
            }
            className="flex-1 h-10 rounded-xl bg-white text-slate-900 text-sm font-semibold"
          >
            View
          </button>
          {l.sellerUserId && (
            <button
              type="button"
              onClick={() =>
                openBuy({
                  itemType,
                  id: l.id,
                  title: l.title,
                  price: l.price,
                  sellerUserId: l.sellerUserId,
                })
              }
              className="flex-1 h-10 rounded-xl bg-emerald-700 text-sm font-semibold"
            >
              Buy
            </button>
          )}
        </div>
      </div>
    </article>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 pb-10 space-y-5">
      <div className="rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 p-5 sm:p-7">
        <div className="text-amber-400 text-sm font-medium mb-1">rvchain Market</div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">RVs · Gear · Parts</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl">
          Separate marketplaces. Low list fees; sale fee is a % when you sell through rvchain — you see
          the % and what you&apos;ll receive. {DEMO_NOTICE_SHORT}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['rvs', 'RVs', Caravan],
            ['gear', 'Gear', Package],
            ['parts', 'Parts', Wrench],
            ['sell', 'Sell', ShieldCheck],
            ['mine', 'Mine', Info],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={`px-3 sm:px-4 h-10 rounded-2xl text-sm font-semibold border flex items-center gap-1.5 transition ${
              view === id
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'border-slate-700 text-slate-300 hover:border-slate-500 bg-slate-900/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {(view === 'rvs' || view === 'gear' || view === 'parts') && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full bg-slate-900 border border-slate-700 pl-10 pr-3 h-11 rounded-2xl text-sm outline-none focus:border-amber-600"
            />
          </div>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="sm:w-40 bg-slate-900 border border-slate-700 h-11 px-3 rounded-2xl text-sm"
          >
            <option value="">All states</option>
            {US_MARKET_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code}
              </option>
            ))}
          </select>
        </div>
      )}

      {view === 'rvs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRvs.length === 0 ? (
            <p className="text-slate-500 text-sm col-span-full py-8 text-center">No RVs match.</p>
          ) : (
            filteredRvs.map((l) =>
              card(
                l,
                'rv',
                'RV',
                `${l.year} · ${RV_CLASS_LABELS[l.rvClass]} · ${l.lengthFt}'`,
                formatRvPrice(l.price)
              )
            )
          )}
        </div>
      )}

      {view === 'gear' && (
        <div className="space-y-3">
          <p className="text-xs text-emerald-400/80">
            Camping gear & accessories — main non-vehicle market.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGear.length === 0 ? (
              <p className="text-slate-500 text-sm col-span-full py-8 text-center">No gear match.</p>
            ) : (
              filteredGear.map((l) =>
                card(
                  l,
                  'gear',
                  GEAR_CATEGORY_LABELS[l.gearCategory],
                  `${GEAR_CONDITION_LABELS[l.condition]} · qty ${l.quantity}`,
                  formatGearPrice(l.price)
                )
              )
            )}
          </div>
        </div>
      )}

      {view === 'parts' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 border border-slate-800 rounded-2xl px-3 py-2 bg-slate-950/50">
            Parts & hardware — secondary section. Fitment is buyer responsibility.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParts.length === 0 ? (
              <p className="text-slate-500 text-sm col-span-full py-8 text-center">No parts match.</p>
            ) : (
              filteredParts.map((l) =>
                card(
                  l,
                  'parts',
                  PARTS_CATEGORY_LABELS[l.partsCategory],
                  `${PARTS_CONDITION_LABELS[l.condition]} · qty ${l.quantity}`,
                  formatPartsPrice(l.price)
                )
              )
            )}
          </div>
        </div>
      )}

      {view === 'sell' && (
        <div className="max-w-2xl space-y-4">
          <MarketplaceDisclosure />
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-4">
            <div className="text-sm font-semibold">What are you selling?</div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['rv', 'RV / camper'],
                  ['gear', 'Camping gear'],
                  ['parts', 'Parts'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSellKind(id)}
                  className={`px-4 h-10 rounded-xl text-sm font-semibold border ${
                    sellKind === id
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'border-slate-700 text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {!user && (
              <button type="button" onClick={onRequestSignIn} className="text-sky-400 text-sm font-semibold">
                Sign in to list →
              </button>
            )}

            {user && !canPub(sellKind) && (
              <div className="rounded-2xl border border-amber-800/40 bg-amber-950/20 p-4 space-y-3">
                <p className="text-sm text-amber-100 font-semibold">
                  {sellKind === 'rv' ? 'RV' : sellKind === 'gear' ? 'Gear' : 'Parts'} listing — $
                  {singleListingPrice(sellKind)} / {SINGLE_LISTING_DAYS} days (demo)
                </p>
                <button
                  type="button"
                  onClick={() => buyCredit(sellKind)}
                  className="w-full h-10 rounded-xl bg-amber-600 font-semibold text-sm"
                >
                  Buy single listing (demo)
                </button>
                <div className="border-t border-slate-800 pt-3">
                  <p className="text-xs text-slate-400 mb-2">Or Seller Pro (up to 10 mixed listings)</p>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setSellerInterval('monthly')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        sellerInterval === 'monthly' ? 'bg-emerald-700' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {formatSellerProPrice('monthly')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSellerInterval('annual')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        sellerInterval === 'annual' ? 'bg-emerald-700' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {formatSellerProPrice('annual')}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={buyPro}
                    className="w-full h-10 rounded-xl bg-emerald-700 font-semibold text-sm"
                  >
                    Activate Seller Pro (demo)
                  </button>
                </div>
              </div>
            )}

            {user && canPub(sellKind) && (
              <p className="text-xs text-emerald-300">
                {subscribed ? 'Seller Pro active.' : `${credits[sellKind]} ${sellKind} credit(s) ready.`}
              </p>
            )}

            <div
              className={`space-y-3 ${user && !canPub(sellKind) ? 'opacity-40 pointer-events-none' : ''}`}
            >
              {sellKind === 'rv' && (
                <>
                  <input
                    className="w-full bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                    placeholder="Title"
                    value={rvForm.title}
                    onChange={(e) => setRvForm((f) => ({ ...f, title: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      placeholder="Make"
                      value={rvForm.make}
                      onChange={(e) => setRvForm((f) => ({ ...f, make: e.target.value }))}
                    />
                    <input
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      placeholder="Model"
                      value={rvForm.model}
                      onChange={(e) => setRvForm((f) => ({ ...f, model: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="number"
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      placeholder="Year"
                      value={rvForm.year}
                      onChange={(e) => setRvForm((f) => ({ ...f, year: e.target.value }))}
                    />
                    <input
                      type="number"
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      placeholder="Price"
                      value={rvForm.price}
                      onChange={(e) => setRvForm((f) => ({ ...f, price: e.target.value }))}
                    />
                    <input
                      type="number"
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      placeholder="Length ft"
                      value={rvForm.lengthFt}
                      onChange={(e) => setRvForm((f) => ({ ...f, lengthFt: e.target.value }))}
                    />
                    <select
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      value={rvForm.rvClass}
                      onChange={(e) =>
                        setRvForm((f) => ({ ...f, rvClass: e.target.value as RvClass }))
                      }
                    >
                      {(Object.entries(RV_CLASS_LABELS) as [RvClass, string][]).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      placeholder="City"
                      value={rvForm.city}
                      onChange={(e) => setRvForm((f) => ({ ...f, city: e.target.value }))}
                    />
                    <select
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      value={rvForm.state}
                      onChange={(e) => setRvForm((f) => ({ ...f, state: e.target.value }))}
                    >
                      {US_MARKET_STATES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-sm"
                    rows={3}
                    placeholder="Description"
                    value={rvForm.description}
                    onChange={(e) => setRvForm((f) => ({ ...f, description: e.target.value }))}
                  />
                  {sellerPayoutPreview(Number(rvForm.price), 'rv')}
                  {sellerChecks}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={publishRv}
                    className="w-full h-11 rounded-xl bg-amber-600 font-semibold text-sm disabled:opacity-50"
                  >
                    Publish RV (demo)
                  </button>
                </>
              )}

              {sellKind === 'gear' && (
                <>
                  <input
                    className="w-full bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                    placeholder="Title"
                    value={gearForm.title}
                    onChange={(e) => setGearForm((f) => ({ ...f, title: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      value={gearForm.gearCategory}
                      onChange={(e) =>
                        setGearForm((f) => ({
                          ...f,
                          gearCategory: e.target.value as GearCategoryId,
                        }))
                      }
                    >
                      {(Object.entries(GEAR_CATEGORY_LABELS) as [GearCategoryId, string][]).map(
                        ([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        )
                      )}
                    </select>
                    <input
                      type="number"
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      placeholder="Price"
                      value={gearForm.price}
                      onChange={(e) => setGearForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      placeholder="City"
                      value={gearForm.city}
                      onChange={(e) => setGearForm((f) => ({ ...f, city: e.target.value }))}
                    />
                    <select
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      value={gearForm.state}
                      onChange={(e) => setGearForm((f) => ({ ...f, state: e.target.value }))}
                    >
                      {US_MARKET_STATES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-sm"
                    rows={3}
                    placeholder="Description"
                    value={gearForm.description}
                    onChange={(e) => setGearForm((f) => ({ ...f, description: e.target.value }))}
                  />
                  {sellerPayoutPreview(Number(gearForm.price), 'gear')}
                  {sellerChecks}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={publishGear}
                    className="w-full h-11 rounded-xl bg-amber-600 font-semibold text-sm disabled:opacity-50"
                  >
                    Publish gear (demo)
                  </button>
                </>
              )}

              {sellKind === 'parts' && (
                <>
                  <input
                    className="w-full bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                    placeholder="Title"
                    value={partsForm.title}
                    onChange={(e) => setPartsForm((f) => ({ ...f, title: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      value={partsForm.partsCategory}
                      onChange={(e) =>
                        setPartsForm((f) => ({
                          ...f,
                          partsCategory: e.target.value as PartsCategoryId,
                        }))
                      }
                    >
                      {(Object.entries(PARTS_CATEGORY_LABELS) as [PartsCategoryId, string][]).map(
                        ([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        )
                      )}
                    </select>
                    <input
                      type="number"
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      placeholder="Price"
                      value={partsForm.price}
                      onChange={(e) => setPartsForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      placeholder="City"
                      value={partsForm.city}
                      onChange={(e) => setPartsForm((f) => ({ ...f, city: e.target.value }))}
                    />
                    <select
                      className="bg-slate-950 border border-slate-700 h-11 px-3 rounded-xl text-sm"
                      value={partsForm.state}
                      onChange={(e) => setPartsForm((f) => ({ ...f, state: e.target.value }))}
                    >
                      {US_MARKET_STATES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-sm"
                    rows={3}
                    placeholder="Description (fitment is buyer responsibility)"
                    value={partsForm.description}
                    onChange={(e) => setPartsForm((f) => ({ ...f, description: e.target.value }))}
                  />
                  {sellerPayoutPreview(Number(partsForm.price), 'parts')}
                  {sellerChecks}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={publishParts}
                    className="w-full h-11 rounded-xl bg-amber-600 font-semibold text-sm disabled:opacity-50"
                  >
                    Publish parts (demo)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'mine' && (
        <div className="space-y-6">
          {!user ? (
            <button type="button" onClick={onRequestSignIn} className="text-sky-400 font-semibold text-sm">
              Sign in to see your listings
            </button>
          ) : (
            <>
              {[
                ['My RVs', myRvs, removeUserListing, formatRvPrice] as const,
                ['My gear', myGear, removeUserGearListing, formatGearPrice] as const,
                ['My parts', myParts, removeUserPartsListing, formatPartsPrice] as const,
              ].map(([label, list, removeFn, fmt]) => (
                <section key={label}>
                  <h3 className="font-semibold text-slate-200 mb-2">
                    {label} ({list.length})
                  </h3>
                  {list.length === 0 ? (
                    <p className="text-xs text-slate-500">None yet.</p>
                  ) : (
                    list.map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between gap-2 py-2 border-b border-slate-800 text-sm"
                      >
                        <div>
                          <div className="font-medium">{l.title}</div>
                          <div className="text-xs text-slate-500">
                            {fmt(l.price)} · {l.status ?? 'active'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            removeFn(l.id);
                            refresh();
                          }}
                          className="text-red-400 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </section>
              ))}
            </>
          )}
        </div>
      )}

      {detail && (
        <div
          className="fixed inset-0 z-[120] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="w-full sm:max-w-lg bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-5 space-y-3 max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-semibold">
                  {detail.itemType}
                </div>
                <h3 className="text-xl font-semibold">{detail.title}</h3>
                <p className="text-xs text-slate-400">{detail.meta}</p>
              </div>
              <button type="button" onClick={() => setDetail(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-300">{detail.description}</p>
            <div className="text-2xl font-bold text-amber-300">
              {detail.itemType === 'rv'
                ? formatRvPrice(detail.price)
                : detail.itemType === 'gear'
                  ? formatGearPrice(detail.price)
                  : formatPartsPrice(detail.price)}
            </div>
            {user?.id && detail.sellerUserId === user.id && sellerPayoutPreview(detail.price, detail.itemType)}
            <div className="flex gap-2">
              {detail.sellerUserId && user?.id !== detail.sellerUserId && (
                <button
                  type="button"
                  onClick={() => {
                    openBuy(detail);
                    setDetail(null);
                  }}
                  className="flex-1 h-11 rounded-xl bg-emerald-600 font-semibold text-sm"
                >
                  Buy through rvchain
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!user) return onRequestSignIn();
                  saveListingInterest({
                    listingId: detail.id,
                    listingTitle: detail.title,
                    message: `Hi, interested in ${detail.title}.`,
                    contactEmail: user.email,
                    userId: user.id,
                    createdAt: new Date().toISOString(),
                  });
                  toast.success('Interest saved locally (demo).');
                }}
                className="flex-1 h-11 rounded-xl border border-amber-700 text-amber-300 text-sm font-semibold flex items-center justify-center gap-1"
              >
                <MessageCircle className="w-4 h-4" /> Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {checkout && (
        <MarketplaceCheckoutModal
          title={checkout.title}
          price={checkout.price}
          itemType={checkout.itemType}
          onClose={() => setCheckout(null)}
          onConfirm={handleCheckoutConfirm}
        />
      )}
    </div>
  );
}
