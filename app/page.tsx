'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  MapPin, Navigation, Heart, User, Search, X, Star, 
  MessagesSquare, Compass, LogIn, Plus, Calendar, Gift, Eye, EyeOff, Caravan, Sparkles, Baby, Leaf
} from 'lucide-react';
import { Park, calculateDistance } from '@/lib/parks';
import { LOCAL_PARK_CATALOG, CATALOG_STATES } from '@/lib/parkCatalog';
import { supabase, Park as SupabasePark } from '@/lib/supabaseClient';
import { checkSupabaseTables, isMissingTableError } from '@/lib/supabaseSetup';
import { listLocalTrips, addLocalTripPark } from '@/lib/localTrips';
import TripPlannerPanel from '@/components/TripPlannerPanel';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { toast } from 'sonner';
import RoadCrewPanel from '@/components/RoadCrewPanel';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import { updateUserPassword } from '@/lib/passwordRecovery';
import {
  isSupabaseConfigured,
  explainAuthError,
  signUpWithEmail,
  signInWithEmail,
  resendSignupConfirmation,
} from '@/lib/auth';
import {
  loadUnifiedRewards,
  getRewardsUserId,
  getActivePoints,
} from '@/lib/rewardsStorage';
import { awardRoadCrewForUser } from '@/lib/roadCrew';
import VerifiedBadge from '@/components/VerifiedBadge';
import { createModeratorVerification, getParkVerificationInfo } from '@/lib/spotVerification';
import { isModerator } from '@/lib/moderator';
import { enrichParks } from '@/lib/localVerification';
import { DEFAULT_SPOT_IMAGE, SPOT_IMAGES, isLocalGrokAsset } from '@/lib/spotImages';
import ForumPanel from '@/components/ForumPanel';
import KidsAdventurePanel from '@/components/KidsAdventurePanel';
import AdultExplorerPanel from '@/components/AdultExplorerPanel';
import HomeHub from '@/components/HomeHub';
import { loadKidsProgress } from '@/lib/kidsProgress';
import ExplorerSignInModal from '@/components/ExplorerSignInModal';
import MarketplaceHub from '@/components/MarketplaceHub';
import ProfileEditor from '@/components/ProfileEditor';
import ProfileAvatar from '@/components/ProfileAvatar';
import {
  UserProfile,
  loadUserProfile,
  saveUserProfile,
  getProfileUserId,
  getDisplayHandle,
} from '@/lib/userProfile';
import {
  clearExplorerSession,
  getActiveExplorerSession,
  getKidsProgressUserId,
  type ActiveExplorerSession,
} from '@/lib/familyExplorers';
import { useIsMobile } from '@/lib/useDeviceType';
import { purgeLegacyWalletStorage } from '@/lib/legacyWalletCleanup';
import { getMembershipPlanId } from '@/lib/membershipSubscription';
import { canUseTripPlanner } from '@/lib/membershipPlans';
import type { RewardProgramId } from '@/lib/rewardPrograms';
import type { LucideIcon } from 'lucide-react';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[min(55vh,420px)] sm:h-[520px] flex items-center justify-center bg-slate-900 rounded-3xl border border-slate-700 text-slate-400">
      Loading interactive map...
    </div>
  ),
});

type Tab =
  | 'home'
  | 'discover'
  | 'kids'
  | 'field'
  | 'marketplace'
  | 'map'
  | 'community'
  | 'trips'
  | 'rewards';

// Auth + Supabase state types
interface User {
  id: string;
  email?: string;
  username?: string;
}

const STATES = CATALOG_STATES;

const NAV_TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: Compass },
  { id: 'marketplace', label: 'Market', icon: Caravan },
  { id: 'kids', label: 'Little Explorer', icon: Sparkles },
  { id: 'field', label: 'Big Explorer', icon: Leaf },
  { id: 'discover', label: 'Spots', icon: MapPin },
  { id: 'map', label: 'Map', icon: Search },
  { id: 'community', label: 'Forum', icon: MessagesSquare },
  { id: 'trips', label: 'Trips', icon: Calendar },
  { id: 'rewards', label: 'Crew', icon: Gift },
];

export default function RVChainApp() {
  const isMobile = useIsMobile();
  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // Spot filters (community spots — search + state only)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');

  // User data
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    typeof window !== 'undefined' ? loadUserProfile(getProfileUserId()) : loadUserProfile('guest')
  );

  // Auth state (Supabase)
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryPasswordConfirm, setRecoveryPasswordConfirm] = useState('');
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);

  // Supabase data (replaces local state for live features)
  const [dbParks, setDbParks] = useState<Park[]>([]);

  const [supabaseReady, setSupabaseReady] = useState(true);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [activeRewardProgram, setActiveRewardProgram] = useState<RewardProgramId>('mileage');

  const syncRewardsState = useCallback(() => {
    const data = loadUnifiedRewards(getRewardsUserId(user?.id));
    setRewardPoints(getActivePoints(data));
    setActiveRewardProgram(data.activeProgram);
  }, [user?.id]);

  // Modals
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'profile' | 'explorers'>('profile');
  const [showSubmitPark, setShowSubmitPark] = useState(false);
  const [verifyingParkId, setVerifyingParkId] = useState<string | null>(null);
  const [showExplorerSignIn, setShowExplorerSignIn] = useState(false);
  const [explorerSession, setExplorerSession] = useState<ActiveExplorerSession | null>(() =>
    typeof window !== 'undefined' ? getActiveExplorerSession() : null
  );

  // Submit park form
  const [newPark, setNewPark] = useState({
    name: '', city: '', state: '', lat: '', lng: '', price: '', description: '', image: ''
  });

  // Chat


  useEffect(() => {
    setExplorerSession(getActiveExplorerSession());
  }, []);

  // Load persisted data (local fallback)
  useEffect(() => {
    purgeLegacyWalletStorage();

    const savedFavorites = localStorage.getItem('rvchain_favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    setUserProfile(loadUserProfile(getProfileUserId()));

    const data = loadUnifiedRewards(getRewardsUserId());
    setRewardPoints(getActivePoints(data));
    setActiveRewardProgram(data.activeProgram);
  }, []);

  // Persist favorites and handle
  useEffect(() => {
    localStorage.setItem('rvchain_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (user) {
      setUserProfile(loadUserProfile(getProfileUserId(user.id)));
    }
  }, [user]);

  // Check whether Supabase tables have been created
  useEffect(() => {
    checkSupabaseTables().then(setSupabaseReady);
  }, []);

  // === SUPABASE AUTH + DATA SETUP ===
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || undefined,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0]
        });
      }
      setSessionLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowPasswordRecovery(true);
        setShowAuthModal(false);
        setShowForgotPassword(false);
      }
      if (event === 'SIGNED_IN' && session?.user) {
        setPendingConfirmationEmail('');
        setShowAuthModal(false);
        setShowAuthPassword(false);
      }
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || undefined,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0]
        });
      } else {
        setUser(null);
      }
      setSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch parks from Supabase (fallback to seed if empty or error)
  useEffect(() => {
    const fetchParks = async () => {
      const { data, error } = await supabase
        .from('parks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setDbParks(enrichParks(LOCAL_PARK_CATALOG));
      } else {
        setDbParks(enrichParks(data as Park[]));
      }
    };
    fetchParks();
  }, []);

  // Community spots — search + state only (not a full campground database)
  const filteredParks = useMemo(() => {
    const sourceParks = enrichParks(dbParks.length > 0 ? dbParks : LOCAL_PARK_CATALOG);
    let result = sourceParks.filter((park) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        park.name.toLowerCase().includes(term) ||
        (park.city?.toLowerCase().includes(term) ?? false) ||
        (park.state?.toLowerCase().includes(term) ?? false) ||
        (park.description?.toLowerCase().includes(term) ?? false);
      const matchesState = !selectedState || park.state === selectedState;
      return matchesSearch && matchesState;
    });

    if (userLocation) {
      result = result
        .filter((park) => park.lat != null && park.lng != null)
        .map((park) => ({
          ...park,
          distance: calculateDistance(userLocation.lat, userLocation.lng, park.lat!, park.lng!),
        }))
        .sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
    }

    return result;
  }, [searchTerm, selectedState, userLocation, dbParks]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedState('');
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        setActiveTab('discover');
        toast.success(`Location found! Sorting parks by distance.`);
      },
      (error) => {
        let msg = "Couldn't get your location.";
        if (error.code === 1) msg = "Location permission denied.";
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 9000 }
    );
  };

  const getDirections = (park: Park) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${park.lat},${park.lng}&travelmode=driving`;
    window.open(url, '_blank');
    toast.success(`Opening directions to ${park.name}`);
  };

  const showParkDetails = (park: Park) => {
    setSelectedPark(park);
  };

  const closeModal = () => setSelectedPark(null);

  const toggleFavorite = (parkId: string) => {
    const isFav = favorites.includes(parkId);
    if (isFav) {
      setFavorites((prev) => prev.filter((id) => id !== parkId));
      toast.info("Removed from My Stops");
    } else {
      setFavorites((prev) => [...prev, parkId]);
      toast.success("Saved to My Stops ❤️");
    }
  };

  const isFavorite = (parkId: string) => favorites.includes(parkId);

  const profileHandle = getDisplayHandle(userProfile, user?.username);

  const handleSaveProfile = async (profile: UserProfile) => {
    const uid = getProfileUserId(user?.id);
    const saved = saveUserProfile(uid, profile);
    setUserProfile(saved);
    setShowProfile(false);

    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        username: saved.handle,
        avatar_url: saved.avatarUrl,
      });
      if (error && !isMissingTableError(error)) {
        toast.error('Profile saved locally. Cloud sync failed.');
      }
    }
  };

  // === AUTH FUNCTIONS ===
  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!authEmail || !authPassword) return toast.error('Enter email and password');
    if (!isSupabaseConfigured) {
      return toast.error('Supabase is not configured. Add API keys to .env.local and restart the dev server.');
    }

    setAuthSubmitting(true);
    try {
      if (isSignUp) {
        const { data, error } = await signUpWithEmail(authEmail, authPassword);
        if (error) throw error;
        if (!data.session) {
          setPendingConfirmationEmail(authEmail.trim().toLowerCase());
          setIsSignUp(false);
          toast.success('Account created! Check your email to confirm, then sign in.');
          return;
        }
        toast.success('Welcome to rvchain! Your account is ready.');
      } else {
        const { data, error } = await signInWithEmail(authEmail, authPassword);
        if (error) throw error;
        if (!data.session) {
          throw new Error('Sign-in did not start a session. Confirm your email or try again.');
        }
        toast.success('Welcome back, RVer!');
      }
      setPendingConfirmationEmail('');
      setAuthEmail('');
      setAuthPassword('');
      setShowAuthModal(false);
      setShowAuthPassword(false);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Auth failed.';
      toast.error(explainAuthError(raw));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    const email = pendingConfirmationEmail || authEmail.trim().toLowerCase();
    if (!email) return toast.error('Enter your email first.');
    setResendingConfirmation(true);
    try {
      const { error } = await resendSignupConfirmation(email);
      if (error) throw error;
      setPendingConfirmationEmail(email);
      toast.success('Confirmation email sent — check your inbox.');
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Could not resend email.';
      toast.error(explainAuthError(raw));
    } finally {
      setResendingConfirmation(false);
    }
  };

  const handleSaveRecoveryPassword = async () => {
    if (recoveryPassword.length < 8) return toast.error('Password must be at least 8 characters.');
    if (recoveryPassword !== recoveryPasswordConfirm) return toast.error('Passwords do not match.');
    setAuthSubmitting(true);
    try {
      const { error } = await updateUserPassword(recoveryPassword);
      if (error) throw error;
      toast.success('Password updated! You are signed in.');
      setShowPasswordRecovery(false);
      setRecoveryPassword('');
      setRecoveryPasswordConfirm('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    syncRewardsState();
    toast.success("Signed out");
  };

  // === SPOT SUBMISSION ===
  const submitNewPark = async () => {
    if (!user) return toast.error("Sign in to share a spot.");
    if (!newPark.name || !newPark.city) return toast.error("Name and city required.");

    try {
      const { error } = await supabase.from('parks').insert({
        name: newPark.name,
        city: newPark.city,
        state: newPark.state || null,
        lat: newPark.lat ? parseFloat(newPark.lat) : null,
        lng: newPark.lng ? parseFloat(newPark.lng) : null,
        price: newPark.price ? parseInt(newPark.price) : null,
        description: newPark.description || null,
        image:
          newPark.image && isLocalGrokAsset(newPark.image)
            ? newPark.image
            : DEFAULT_SPOT_IMAGE,
        submitted_by: user.id,
        verified: false,
        amenities: []  // user can expand later
      });
      if (error) throw error;

      toast.success("Spot shared! Thanks for helping the community.");
      const crewPts = awardRoadCrewForUser(user.id, getMembershipPlanId(user.id), 'checklist_item', 'Shared a spot');
      if (crewPts > 0) {
        syncRewardsState();
        toast.message(`Road Crew +${crewPts} pts`);
      }
      setShowSubmitPark(false);
      setNewPark({ name: '', city: '', state: '', lat: '', lng: '', price: '', description: '', image: '' });

      // Refresh parks list
      const { data } = await supabase.from('parks').select('*').order('created_at', { ascending: false });
      if (data) setDbParks(enrichParks(data as Park[]));
    } catch (err: any) {
      toast.error("Submission failed: " + (err.message || err));
    }
  };

  const refreshParks = async () => {
    const { data } = await supabase.from('parks').select('*').order('created_at', { ascending: false });
    if (data?.length) {
      setDbParks(enrichParks(data as Park[]));
    } else {
      setDbParks(enrichParks(LOCAL_PARK_CATALOG));
    }
  };

  const isSupabaseParkId = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  const verifyPark = async (park: Park) => {
    if (!user) return toast.error('Sign in to verify spots.');
    if (!isModerator(user)) return toast.error('Only moderators can verify spots.');
    if (park.verified) return;

    setVerifyingParkId(park.id);
    const toastId = toast.loading('Marking spot as verified…');

    try {
      const verifiedBy = user.email ?? user.username ?? 'moderator';
      const record = createModeratorVerification(verifiedBy);

      const updatedPark: Park = {
        ...park,
        verified: true,
        verified_at: record.verifiedAt,
        verified_by: record.verifiedBy,
      };

      if (isSupabaseParkId(park.id)) {
        const { error } = await supabase.from('parks').update({
          verified: true,
          verified_at: record.verifiedAt,
          verified_by: record.verifiedBy,
        }).eq('id', park.id);

        if (error) {
          toast.dismiss(toastId);
          toast.warning('Verified locally; Supabase update failed. Run the migration SQL.');
          setDbParks((prev) =>
            enrichParks(prev.map((p) => (p.id === park.id ? updatedPark : p)))
          );
          if (selectedPark?.id === park.id) setSelectedPark(updatedPark);
          return;
        }
        await refreshParks();
      } else {
        setDbParks((prev) =>
          enrichParks(prev.map((p) => (p.id === park.id ? updatedPark : p)))
        );
      }

      if (selectedPark?.id === park.id) setSelectedPark(updatedPark);

      toast.dismiss(toastId);
      toast.success('Spot verified!');
    } catch {
      toast.dismiss(toastId);
      toast.error('Verification failed. Try again.');
    } finally {
      setVerifyingParkId(null);
    }
  };

  const addParkToTripFromDiscover = async (parkId: string) => {
    if (!user) return toast.error('Sign in to add parks to a trip.');
    if (!canUseTripPlanner(getMembershipPlanId(user.id))) {
      toast.info('Trip planner requires Weekender or higher.');
      setActiveTab('trips');
      return;
    }
    const trips = listLocalTrips(user.id);
    if (trips.length === 0) {
      toast.info('Create a trip in the Trips tab first.');
      setActiveTab('trips');
      return;
    }
    const trip = trips[0];
    const sourceParks = enrichParks(dbParks.length > 0 ? dbParks : LOCAL_PARK_CATALOG);
    addLocalTripPark(user.id, trip.id, parkId, sourceParks);
    if (supabaseReady && !trip.id.startsWith('local-')) {
      const { error } = await supabase.from('trip_parks').insert({
        trip_id: trip.id,
        park_id: parkId,
        visit_order: 999,
      });
      if (error && isMissingTableError(error)) setSupabaseReady(false);
    }
    toast.success(`Added to "${trip.title}"`);
    setActiveTab('trips');
  };

  // Profile / favorites
  const openProfile = (tab: 'profile' | 'explorers' = 'profile') => {
    setProfileInitialTab(tab);
    setShowProfile(true);
  };

  const kidsProgressUserId = getKidsProgressUserId(explorerSession, user?.id);
  const kidsDisplayHandle = explorerSession?.nickname ?? profileHandle;

  const removeFavorite = (parkId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== parkId));
  };

  const allParks = enrichParks(dbParks.length > 0 ? dbParks : LOCAL_PARK_CATALOG);
  const favoritedParks = allParks.filter((p) => favorites.includes(p.id));

  // Stats
  const totalParks = allParks.length;
  const connectedRVers = "28,419";

  return (
    <div className="min-h-screen text-slate-200 overflow-x-hidden w-full max-w-[100vw] app-main">
      {!supabaseReady && (
        <div className="bg-amber-950/80 border-b border-amber-700/50 px-3 sm:px-4 py-2 text-center text-xs sm:text-sm text-amber-100 leading-snug">
          <span className="sm:hidden">Local-only mode — run <code className="bg-amber-900/50 px-1 rounded">supabase-setup.sql</code> for cloud sync.</span>
          <span className="hidden sm:inline">
            Database tables not set up yet — trips and forum posts save on this device only.{' '}
            <span className="text-amber-300 font-medium">
              Open Supabase → SQL Editor → run <code className="text-xs bg-amber-900/50 px-1 rounded">supabase-setup.sql</code>
            </span>
          </span>
        </div>
      )}
      {/* Header */}
      <header className="rv-header border-b border-green-800/60 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-3 sm:px-6">
          <div className="rv-header-inner flex items-center justify-between h-14 sm:h-16 min-w-0">
            <div className="flex items-center gap-x-2 sm:gap-x-3 min-w-0 shrink">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 shadow-inner ring-1 ring-white/15">
                <Image
                  src="/rvchain-logo.jpg"
                  alt="rvchain logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div className="min-w-0">
                <div className="rv-logo-text font-semibold text-xl sm:text-3xl tracking-tighter text-white truncate">rvchain</div>
                <div className="rv-logo-tagline text-[10px] text-green-300 -mt-0.5 font-medium tracking-[1.5px]">FAMILY ROAD LIFE</div>
              </div>
            </div>

            <div className="rv-header-actions flex items-center gap-x-1.5 sm:gap-x-3 shrink-0">
              <button
                onClick={() => setActiveTab('rewards')}
                className="flex items-center gap-x-1 text-xs sm:text-sm bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur px-2 sm:px-3 py-1.5 rounded-2xl text-amber-200 transition"
                title="Road Crew points"
              >
                <Gift className="w-3.5 h-3.5 shrink-0" />
                <span className="font-semibold text-amber-100">{rewardPoints.toLocaleString()}</span>
                <span className="text-amber-300/80 text-[10px] sm:text-xs hidden min-[380px]:inline">crew</span>
              </button>

              <div className="hidden lg:flex items-center gap-x-2 text-sm bg-white/10 backdrop-blur px-3 py-1.5 rounded-2xl text-green-100">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span><span className="font-semibold text-white">{connectedRVers}</span> RVers connected</span>
              </div>

              {explorerSession ? (
                <div className="flex items-center gap-x-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('kids')}
                    className="flex items-center gap-x-1.5 bg-amber-500/20 hover:bg-amber-500/30 transition px-2 sm:px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-medium text-amber-100"
                    title="Explorer mode"
                  >
                    <Baby className="w-4 h-4 shrink-0" />
                    <span className="max-w-[5rem] sm:max-w-[7rem] truncate">{explorerSession.nickname}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearExplorerSession();
                      setExplorerSession(null);
                      toast.success('Explorer signed out');
                    }}
                    className="text-[10px] sm:text-xs px-2 py-1 hover:bg-white/10 rounded text-slate-300"
                  >
                    Exit
                  </button>
                </div>
              ) : user ? (
                <div className="flex items-center gap-x-1">
                  <button 
                    onClick={() => openProfile('profile')}
                    className="flex items-center gap-x-1.5 bg-white/10 hover:bg-white/15 transition px-2 sm:px-3 py-1.5 rounded-2xl text-sm font-medium"
                    title="Edit profile"
                  >
                    <ProfileAvatar handle={profileHandle} avatarUrl={userProfile.avatarUrl} size="sm" />
                    <span className="hidden md:inline font-medium max-w-[6rem] truncate">{profileHandle}</span>
                  </button>
                  <button onClick={handleSignOut} className="hidden sm:inline text-xs px-2 py-1 hover:bg-white/10 rounded">Sign out</button>
                </div>
              ) : (
                <div className="flex items-center gap-x-1">
                  <button
                    type="button"
                    onClick={() => setShowExplorerSignIn(true)}
                    className="hidden sm:flex items-center gap-x-1 bg-amber-500/15 hover:bg-amber-500/25 transition px-2 py-1.5 rounded-2xl text-xs font-medium text-amber-100"
                    title="Explorer sign-in"
                  >
                    <Baby className="w-3.5 h-3.5" />
                    Explorer
                  </button>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-x-1.5 bg-white/10 hover:bg-white/15 transition px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-medium"
                  >
                    <LogIn className="w-4 h-4 shrink-0" />
                    <span className="hidden min-[380px]:inline">Sign in</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="app-main">
      {/* Hero — compact on mobile; hidden on other tabs to save space */}
      {(!isMobile || activeTab === 'discover') && (
      <div className="rv-hero max-w-screen-xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-y-3">
          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tighter">Market. Family.<br className="hidden sm:block" /><span className="sm:hidden"> </span>Crew on the road.</h1>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-lg text-slate-100 max-w-md [text-shadow:0_1px_3px_rgb(15_23_42/0.75)]">Sell RVs &amp; gear, Explorer adventures, community spots &amp; trips — not a campground booking engine.</p>
          </div>

          <div className="flex flex-col min-[400px]:flex-row items-stretch sm:items-center gap-2 sm:gap-x-3 w-full sm:w-auto">
            <button 
              onClick={useMyLocation}
              className="flex items-center justify-center gap-x-2 px-4 sm:px-5 h-11 bg-white text-slate-900 hover:bg-amber-50 active:bg-white font-semibold rounded-3xl transition text-sm shadow-sm"
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>Use My Location</span>
            </button>
            <button 
              onClick={() => setActiveTab('discover')}
              className="flex items-center justify-center gap-x-2 px-4 sm:px-5 h-11 border border-white/30 hover:bg-white/5 font-medium rounded-3xl transition text-sm"
            >
              Browse community spots
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Desktop / tablet tabs */}
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4 hidden md:block">
        <div className="desktop-tabs rv-tab-bar flex text-sm sm:text-base">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-x-2 shrink-0 ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>


      {/* HOME HUB */}
      {activeTab === 'home' && (
        <HomeHub
          displayName={explorerSession?.nickname ?? (user ? profileHandle : null)}
          onGo={(tab) => setActiveTab(tab)}
          tripCount={user ? listLocalTrips(user.id).length : 0}
          plantCount={Object.keys(loadKidsProgress(user?.id || kidsProgressUserId).finds || {}).length}
          rewardPoints={rewardPoints}
        />
      )}

      {/* KIDS ZONE — no GPS / photos / child data collection */}
      {activeTab === 'kids' && (
        <KidsAdventurePanel stateCode={selectedState || null} />
      )}

      {/* ADULT FIELD EXPLORER — geo-catch + collection */}
      {activeTab === 'field' && (
        <AdultExplorerPanel
          userId={user?.id || kidsProgressUserId}
          stateCode={selectedState || null}
          displayHandle={user ? kidsDisplayHandle : null}
        />
      )}

      {/* COMMUNITY SPOTS (not a full campground database) */}
      {activeTab === 'discover' && (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
          <div className="mb-5 section-intro">
            <h2 className="text-xl sm:text-2xl font-semibold">Community spots</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Shared picks and public leads — not a nationwide campground inventory. Use directions,
              save favorites, and add stops on Trips. Sample spots are fictional demo data.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search spots, cities, or states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-green-600 transition pl-11 pr-4 h-12 rounded-3xl text-base placeholder:text-slate-500 outline-none"
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-3.5 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="sm:w-52 bg-slate-900 border border-slate-700 focus:border-green-600 h-12 px-4 rounded-3xl text-base outline-none"
            >
              <option value="">All States</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between mb-3 px-1 section-intro">
            <div>
              <span className="font-semibold text-xl">{filteredParks.length}</span>
              <span className="text-slate-400 text-sm ml-1">community spots</span>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <button onClick={() => setShowSubmitPark(true)} className="text-xs flex items-center gap-1 bg-orange-600 hover:bg-orange-500 px-3 py-1.5 rounded-2xl font-medium">
                  <Plus className="w-3 h-3"/> Share a spot
                </button>
              )}
              <button onClick={clearFilters} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>

          {/* Parks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
            {filteredParks.length === 0 ? (
              <div className="col-span-full text-center py-10 text-slate-400">
                No spots match.<br />
                <button onClick={clearFilters} className="mt-3 underline text-green-400">Clear search</button>
              </div>
            ) : (
              filteredParks.map((park) => {
                const fav = isFavorite(park.id);
                const dist = (park as any).distance;
                return (
                  <div key={park.id} onClick={() => showParkDetails(park)} className="rv-card bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden flex flex-col cursor-pointer">
                    <div className="relative">
                      <img src={park.image ?? ''} className="w-full h-40 object-cover" alt={park.name} />
                      <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-medium px-2.5 py-0.5 rounded-2xl backdrop-blur flex items-center gap-1">
                        <Star className="w-3 h-3" /> {park.rating}
                      </div>
                      {fav && <div className="absolute top-3 left-3 text-lg">❤️</div>}
                      {park.verified && (
                        <div className="absolute bottom-2 left-2" onClick={(e) => e.stopPropagation()}>
                          <VerifiedBadge
                            verifiedBy={getParkVerificationInfo(park)?.verifiedBy}
                            verifiedAt={getParkVerificationInfo(park)?.verifiedAt}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <div className="font-semibold text-lg leading-tight flex items-center gap-2">
                        {park.name}
                      </div>
                      <div className="text-emerald-300 text-sm">{park.city}, {park.state}</div>

                      {dist !== undefined && (
                        <div className="text-xs text-emerald-300 font-medium mt-0.5">{dist.toFixed(0)} mi away</div>
                      )}

                      <div className="mt-3 flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl font-semibold">${park.price}</span>
                          <span className="text-xs text-slate-400">/night</span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {park.amenities.slice(0, 3).map((a) => (
                          <div key={a} className="amenity-pill text-[10px] px-2 py-px">{a}</div>
                        ))}
                        {park.amenities.length > 3 && (
                          <div className="amenity-pill text-[10px] px-2 py-px">+{park.amenities.length - 3}</div>
                        )}
                      </div>

                      <div className="flex-1" />

                      <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => showParkDetails(park)}
                          className="flex-1 bg-white text-slate-900 hover:bg-slate-100 transition font-semibold py-2 text-sm rounded-2xl"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => getDirections(park)}
                          className="flex-1 border border-emerald-700 hover:bg-emerald-900/20 transition font-medium py-2 text-sm rounded-2xl text-emerald-300"
                        >
                          Navigate
                        </button>
                        <button
                          onClick={() => toggleFavorite(park.id)}
                          className="px-3 border border-slate-600 hover:bg-slate-800 rounded-2xl text-lg"
                          title={fav ? "Remove from favorites" : "Save to My Stops"}
                        >
                          {fav ? "❤️" : "♡"}
                        </button>
                        {user && canUseTripPlanner(getMembershipPlanId(user.id)) && (
                          <button
                            onClick={() => addParkToTripFromDiscover(park.id)}
                            className="px-3 border border-emerald-700 hover:bg-emerald-900/30 rounded-2xl text-xs text-emerald-300"
                            title="Add to current trip"
                          >
                            +Trip
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MARKETPLACE: RVs · Gear · Parts */}
      {activeTab === 'marketplace' && (
        <MarketplaceHub
          user={user}
          displayHandle={profileHandle}
          onRequestSignIn={() => setShowAuthModal(true)}
        />
      )}

      {/* MAP */}
      {activeTab === 'map' && (
        !user ? (
          <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-12 sm:py-16">
            <div className="max-w-md mx-auto text-center space-y-5 p-8 rounded-3xl border border-slate-700 bg-slate-900/80">
              <div className="w-14 h-14 rounded-2xl bg-sky-900/40 flex items-center justify-center mx-auto">
                <MapPin className="w-7 h-7 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold">Sign in to explore the park map</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                The interactive map with park markers and directions is available to signed-in members.
                Browse Discover without an account, or sign in to open the map.
              </p>
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-white text-black h-11 rounded-3xl font-semibold text-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </button>
            </div>
          </div>
        ) : (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-3 section-intro">
            <div>
              <h2 className="font-semibold text-2xl">Spots on the map</h2>
              <p className="text-slate-400 text-sm">Community picks — tap for directions (book stays off-site)</p>
            </div>
            <div className="text-sm bg-slate-900 px-4 py-1.5 rounded-2xl border border-slate-700">
              Showing <span className="font-semibold">{filteredParks.length}</span> parks
            </div>
          </div>

          <MapView 
            parks={filteredParks} 
            userLocation={userLocation} 
            onParkSelect={showParkDetails} 
            onGetDirections={getDirections} 
          />

          <div className="mt-3 text-xs text-slate-400 flex items-center gap-x-2 px-1 section-intro">
            <div className="flex items-center gap-x-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Available now</span>
            </div>
            <span>•</span>
            <span>Tap markers → Open directions for GPS navigation</span>
          </div>
        </div>
        )
      )}

      {/* FORUM */}
      {activeTab === 'community' && (
        <ForumPanel
          user={user}
          displayHandle={profileHandle}
          displayAvatar={userProfile.avatarUrl}
          onRequestSignIn={() => setShowAuthModal(true)}
          onRequestUpgrade={() => setActiveTab('trips')}
          onOpenProfile={user ? openProfile : undefined}
        />
      )}

      {/* Park Detail Modal */}
      {selectedPark && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center"
          onClick={closeModal}
        >
          <div 
            className="modal bg-slate-900 w-full sm:w-[520px] sm:rounded-t-3xl sm:rounded-b-3xl border-t sm:border border-slate-700 rounded-t-3xl max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <div className="font-semibold text-2xl pr-6">{selectedPark.name}</div>
              <button onClick={closeModal} className="text-3xl leading-none text-slate-400 hover:text-white w-9 h-9 flex items-center justify-center">×</button>
            </div>

            <div className="px-5">
              <div className="text-emerald-300 mb-1">{selectedPark.city}, {selectedPark.state}</div>

              <div className="w-full h-48 bg-cover bg-center rounded-2xl mb-4 border border-slate-700" style={{ backgroundImage: `url('${selectedPark.image}')` }} />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-x-2">
                  <div className="flex items-center text-lg font-semibold">
                    <Star className="text-amber-400 w-5 h-5 mr-1" /> {selectedPark.rating}
                  </div>
                  <div className="text-xl font-semibold ml-1">${selectedPark.price}<span className="text-sm text-slate-400">/night</span></div>
                </div>
                {userLocation && selectedPark.lat != null && selectedPark.lng != null && (
                  <div className="text-sm bg-slate-800 px-3 py-1 rounded-2xl">
                    {calculateDistance(userLocation.lat, userLocation.lng, selectedPark.lat, selectedPark.lng).toFixed(0)} miles from you
                  </div>
                )}
              </div>

              <div className="text-slate-300 leading-relaxed text-[15px] mb-5">{selectedPark.description}</div>

              {selectedPark.verified && (
                <div className="mb-4 flex justify-center">
                  <VerifiedBadge
                    verifiedBy={getParkVerificationInfo(selectedPark)?.verifiedBy}
                    verifiedAt={getParkVerificationInfo(selectedPark)?.verifiedAt}
                    size="lg"
                  />
                </div>
              )}

              {user && isModerator(user) && !selectedPark.verified && (
                <button
                  onClick={() => verifyPark(selectedPark)}
                  disabled={verifyingParkId === selectedPark.id}
                  className="mb-4 w-full text-xs bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 py-2.5 rounded-2xl font-medium"
                >
                  {verifyingParkId === selectedPark.id
                    ? 'Verifying…'
                    : 'Verify spot (moderator)'}
                </button>
              )}

              <div>
                <div className="uppercase text-xs tracking-widest text-slate-400 mb-2">Amenities</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPark.amenities.map((a) => (
                    <div key={a} className="amenity-pill px-3 py-1 text-xs">{a}</div>
                  ))}
                </div>
              </div>

              {selectedPark.source === 'demo-sample' && (
                <p className="mt-4 text-[10px] text-amber-500/90 leading-relaxed">
                  Fictional demo sample — not a real campground, agency site, or brand.
                </p>
              )}
            </div>

            <div className="p-5 bg-slate-950 mt-5 border-t border-slate-700 flex flex-col gap-y-3">
              <button 
                onClick={() => getDirections(selectedPark)}
                className="w-full bg-orange-600 hover:bg-orange-500 transition text-white font-semibold h-12 rounded-3xl flex items-center justify-center gap-x-2 shadow-sm active:scale-[0.985]"
              >
                <Navigation className="w-4 h-4" />
                <span className="font-semibold">Open directions</span>
              </button>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <button 
                  onClick={() => toggleFavorite(selectedPark.id)}
                  className="flex items-center justify-center gap-x-2 border border-slate-600 hover:bg-slate-900 h-11 rounded-3xl"
                >
                  <Heart className="w-4 h-4" /> 
                  {isFavorite(selectedPark.id) ? "Remove from My Stops" : "Save to My Stops"}
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('map');
                    closeModal();
                    // The map component will auto center via props
                  }}
                  className="flex items-center justify-center gap-x-2 border border-slate-600 hover:bg-slate-900 h-11 rounded-3xl"
                >
                  <MapPin className="w-4 h-4" /> View on Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile editor */}
      {showProfile && user && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center"
          onClick={() => setShowProfile(false)}
        >
          <ProfileEditor
            key={profileInitialTab}
            profile={userProfile}
            profileUserId={getProfileUserId(user?.id)}
            parentUserId={user.id}
            userEmail={user.email}
            favoritesCount={favorites.length}
            favoritedParks={favoritedParks}
            onSave={handleSaveProfile}
            onClose={() => setShowProfile(false)}
            onParkSelect={(park) => { showParkDetails(park); setShowProfile(false); }}
            onRemoveFavorite={removeFavorite}
            onGoToForum={() => setActiveTab('community')}
            initialTab={profileInitialTab}
          />
        </div>
      )}

      {showExplorerSignIn && (
        <ExplorerSignInModal
          onClose={() => setShowExplorerSignIn(false)}
          onSuccess={(session) => {
            setExplorerSession(session);
            setShowExplorerSignIn(false);
            setActiveTab('kids');
          }}
        />
      )}

      {showPasswordRecovery && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[112] flex items-center justify-center p-4"
          onClick={() => setShowPasswordRecovery(false)}
        >
          <div
            className="modal bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-2">Set a new password</h3>
            <p className="text-sm text-slate-400 mb-4">You opened a valid reset link. Choose a new password.</p>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showRecoveryPassword ? 'text' : 'password'}
                  value={recoveryPassword}
                  onChange={(e) => setRecoveryPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full bg-slate-800 border border-slate-600 pl-4 pr-11 h-11 rounded-2xl text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowRecoveryPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                >
                  {showRecoveryPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input
                type={showRecoveryPassword ? 'text' : 'password'}
                value={recoveryPasswordConfirm}
                onChange={(e) => setRecoveryPasswordConfirm(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-slate-800 border border-slate-600 px-4 h-11 rounded-2xl text-sm"
              />
              <button
                onClick={handleSaveRecoveryPassword}
                disabled={authSubmitting}
                className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-50 h-11 rounded-2xl font-semibold text-sm"
              >
                {authSubmitting ? 'Saving…' : 'Save & log in'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showForgotPassword && (
        <ForgotPasswordModal
          initialEmail={authEmail}
          onClose={() => {
            setShowForgotPassword(false);
            setShowAuthModal(true);
            setIsSignUp(false);
          }}
          onLoggedIn={() => {
            setShowForgotPassword(false);
            setAuthEmail('');
            setAuthPassword('');
            setShowAuthPassword(false);
          }}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && !showForgotPassword && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center"
          onClick={() => { setShowAuthModal(false); setShowAuthPassword(false); }}
        >
          <div className="modal bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">{isSignUp ? 'Create Account' : 'Sign In'} to rvchain</h3>

            {pendingConfirmationEmail && (
              <div className="mb-4 p-3 rounded-2xl border border-sky-800/50 bg-sky-950/30 text-xs text-sky-200/90 leading-relaxed">
                Confirm <strong className="text-sky-100">{pendingConfirmationEmail}</strong> via the link in your email, then sign in below.
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendingConfirmation}
                  className="block mt-2 text-sky-400 hover:text-sky-300 underline disabled:opacity-50"
                >
                  {resendingConfirmation ? 'Sending…' : 'Resend confirmation email'}
                </button>
              </div>
            )}

            {!isSupabaseConfigured && (
              <div className="mb-4 p-3 rounded-2xl border border-amber-800/50 bg-amber-950/30 text-xs text-amber-200/90">
                Supabase API keys are missing. Copy <code className="text-amber-100">.env.local.example</code> to <code className="text-amber-100">.env.local</code> and restart the dev server.
              </div>
            )}
            
            <form onSubmit={handleAuth} className="space-y-4">
              <input 
                type="email" 
                placeholder="you@rv.com" 
                value={authEmail} 
                onChange={e => setAuthEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 px-4 h-11 rounded-2xl" 
                required 
              />
              <div className="relative">
                <input
                  type={showAuthPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 pl-4 pr-11 h-11 rounded-2xl"
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowAuthPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
                  aria-label={showAuthPassword ? 'Hide password' : 'Show password'}
                >
                  {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isSignUp && (
                <div className="flex justify-between items-center -mt-1 gap-2">
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendingConfirmation || !authEmail.trim()}
                    className="text-xs text-slate-400 hover:text-slate-300 transition disabled:opacity-40"
                  >
                    Resend confirmation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuthModal(false);
                      setShowForgotPassword(true);
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 transition"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              <button 
                type="submit" 
                disabled={authSubmitting || sessionLoading}
                className="w-full bg-green-700 hover:bg-green-600 h-11 rounded-3xl font-semibold disabled:opacity-50"
              >
                {authSubmitting ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
            </form>

            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-emerald-400 mt-4 w-full"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'New here? Create account'}
            </button>
            <button
              onClick={() => { setShowAuthModal(false); setShowAuthPassword(false); }}
              className="text-xs text-slate-400 mt-2 w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Submit Park Modal (real backend) */}
      {showSubmitPark && (
        <div className="fixed inset-0 bg-black/70 z-[110] flex items-center justify-center p-4" onClick={() => setShowSubmitPark(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md" onClick={e=>e.stopPropagation()}>
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2"><Plus className="w-5 h-5"/> Submit a New RV Park</h3>
            
            <div className="space-y-3">
              <input placeholder="Park Name" value={newPark.name} onChange={e=>setNewPark({...newPark, name:e.target.value})} className="w-full bg-slate-800 border border-slate-600 px-4 h-10 rounded-2xl" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="City" value={newPark.city} onChange={e=>setNewPark({...newPark, city:e.target.value})} className="bg-slate-800 border border-slate-600 px-4 h-10 rounded-2xl" />
                <input placeholder="State (e.g. MT)" value={newPark.state} onChange={e=>setNewPark({...newPark, state:e.target.value})} className="bg-slate-800 border border-slate-600 px-4 h-10 rounded-2xl" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Lat" value={newPark.lat} onChange={e=>setNewPark({...newPark, lat:e.target.value})} className="bg-slate-800 border border-slate-600 px-4 h-10 rounded-2xl" />
                <input placeholder="Lng" value={newPark.lng} onChange={e=>setNewPark({...newPark, lng:e.target.value})} className="bg-slate-800 border border-slate-600 px-4 h-10 rounded-2xl" />
                <input placeholder="Price/night" value={newPark.price} onChange={e=>setNewPark({...newPark, price:e.target.value})} className="bg-slate-800 border border-slate-600 px-4 h-10 rounded-2xl" />
              </div>
              <textarea placeholder="Description" value={newPark.description} onChange={e=>setNewPark({...newPark, description:e.target.value})} className="w-full bg-slate-800 border border-slate-600 p-4 rounded-2xl h-20" />
              <div>
                <p className="text-xs text-slate-400 mb-2">Scene (Grok Imagine art)</p>
                <div className="grid grid-cols-4 gap-2">
                  {SPOT_IMAGES.map((src) => {
                    const active = (newPark.image || DEFAULT_SPOT_IMAGE) === src;
                    return (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setNewPark({ ...newPark, image: src })}
                        className={`rounded-xl overflow-hidden border-2 ${active ? 'border-orange-500' : 'border-slate-700'}`}
                      >
                        <img src={src} alt="" className="h-12 w-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSubmitPark(false)} className="flex-1 border border-slate-600 h-11 rounded-3xl">Cancel</button>
              <button onClick={submitNewPark} className="flex-1 bg-orange-600 hover:bg-orange-500 h-11 rounded-3xl font-semibold">Submit Park</button>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 text-center">Your submission will be visible to everyone. A moderator can mark it verified after review.</p>
          </div>
        </div>
      )}

      {/* REWARDS TAB */}
      {activeTab === 'rewards' && (
        <RoadCrewPanel
          user={user}
          onRequestSignIn={() => setShowAuthModal(true)}
          onRequestUpgrade={() => setActiveTab('trips')}
          onPointsChange={syncRewardsState}
        />
      )}

      {activeTab === 'trips' && (
        <TripPlannerPanel
          user={user}
          allParks={allParks}
          quickAddParks={filteredParks}
          onRequestSignIn={() => setShowAuthModal(true)}
        />
      )}

      <footer className="section-intro max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8 text-center text-[10px] sm:text-xs text-slate-500 border-t border-slate-800 mt-6 sm:mt-8 space-y-2">
        <p className="text-amber-400/90 max-w-lg mx-auto leading-relaxed">
          Demonstration only — memberships, Seller Pro, rewards, and listings are simulated on your device. No real charges or seller notifications.
        </p>
        <p>rvchain • Powered by Supabase</p>
      </footer>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="mobile-bottom-nav md:hidden" aria-label="Main navigation">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
