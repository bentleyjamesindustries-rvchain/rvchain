'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  MessagesSquare, Compass, LogIn, Calendar, Gift, Eye, EyeOff, Caravan, Sparkles, Baby, Leaf, Bot
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { checkSupabaseTables, isMissingTableError } from '@/lib/supabaseSetup';
import { listLocalTrips } from '@/lib/localTrips';
import TripPlannerPanel from '@/components/TripPlannerPanel';
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
import ForumPanel from '@/components/ForumPanel';
import KidsAdventurePanel from '@/components/KidsAdventurePanel';
import AdultExplorerPanel from '@/components/AdultExplorerPanel';
import HomeHub from '@/components/HomeHub';
import { loadKidsProgress } from '@/lib/kidsProgress';
import ExplorerSignInModal from '@/components/ExplorerSignInModal';
import MarketLive from '@/components/MarketLive';
import TrailheadAI from '@/components/TrailheadAI';
import SiteFooter from '@/components/SiteFooter';
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
import type { RewardProgramId } from '@/lib/rewardPrograms';
import type { LucideIcon } from 'lucide-react';

type Tab =
  | 'home'
  | 'ai'
  | 'kids'
  | 'field'
  | 'marketplace'
  | 'community'
  | 'trips'
  | 'rewards'

// Auth + Supabase state types
interface User {
  id: string;
  email?: string;
  username?: string;
}

const NAV_TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: Compass },
  { id: 'ai', label: 'Trailhead AI', icon: Bot },
  { id: 'marketplace', label: 'Market', icon: Caravan },
  { id: 'kids', label: 'Little Explorer', icon: Sparkles },
  { id: 'field', label: 'Big Explorer', icon: Leaf },
  { id: 'community', label: 'Forum', icon: MessagesSquare },
  { id: 'trips', label: 'Trips', icon: Calendar },
  { id: 'rewards', label: 'Crew', icon: Gift },
];

export default function RVChainApp() {
  const isMobile = useIsMobile();
  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('home');


  // User data
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


  const [supabaseReady, setSupabaseReady] = useState(true);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [activeRewardProgram, setActiveRewardProgram] = useState<RewardProgramId>('mileage');

  const syncRewardsState = useCallback(() => {
    const data = loadUnifiedRewards(getRewardsUserId(user?.id));
    setRewardPoints(getActivePoints(data));
    setActiveRewardProgram(data.activeProgram);
  }, [user?.id]);

  // Modals
  const [showProfile, setShowProfile] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'profile' | 'explorers'>('profile');
  const [showExplorerSignIn, setShowExplorerSignIn] = useState(false);
  const [explorerSession, setExplorerSession] = useState<ActiveExplorerSession | null>(() =>
    typeof window !== 'undefined' ? getActiveExplorerSession() : null
  );


  // Chat


  useEffect(() => {
    setExplorerSession(getActiveExplorerSession());
  }, []);

  // Load persisted data (local fallback)
  useEffect(() => {
    purgeLegacyWalletStorage();


    setUserProfile(loadUserProfile(getProfileUserId()));

    const data = loadUnifiedRewards(getRewardsUserId());
    setRewardPoints(getActivePoints(data));
    setActiveRewardProgram(data.activeProgram);
  }, []);


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


  // Profile / favorites
  const openProfile = (tab: 'profile' | 'explorers' = 'profile') => {
    setProfileInitialTab(tab);
    setShowProfile(true);
  };

  const kidsProgressUserId = getKidsProgressUserId(explorerSession, user?.id);
  const kidsDisplayHandle = explorerSession?.nickname ?? profileHandle;

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
      {/* Hero — market-first; compact on mobile home only */}
      {(!isMobile || activeTab === 'home') && (
      <div className="rv-hero max-w-screen-xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-y-3">
          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tighter">Road. Trail.<br className="hidden sm:block" /><span className="sm:hidden"> </span>Ready.</h1>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-lg text-slate-100 max-w-md [text-shadow:0_1px_3px_rgb(15_23_42/0.75)]">Trailhead AI for recreational vehicles — campers, trucks, ATVs, dirt bikes, snowmobiles — plus private-party gear &amp; parts.</p>
          </div>
          <div className="flex flex-col min-[400px]:flex-row items-stretch sm:items-center gap-2 sm:gap-x-3 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('ai')}
              className="flex items-center justify-center gap-x-2 px-4 sm:px-5 h-11 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-3xl transition text-sm shadow-sm"
            >
              <Bot className="w-4 h-4 shrink-0" />
              <span>Trailhead AI</span>
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className="flex items-center justify-center gap-x-2 px-4 sm:px-5 h-11 bg-white text-slate-900 hover:bg-amber-50 font-semibold rounded-3xl transition text-sm shadow-sm"
            >
              <Caravan className="w-4 h-4 shrink-0" />
              <span>Market</span>
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

      {activeTab === 'ai' && (
        <TrailheadAI
          user={user}
          onRequestSignIn={() => setShowAuthModal(true)}
          onGoMarket={() => setActiveTab('marketplace')}
        />
      )}

      {/* KIDS ZONE — no GPS / photos / child data collection */}
      {activeTab === 'kids' && (
        <KidsAdventurePanel stateCode={null} />
      )}

      {/* Big Explorer — Trail Log (adult ride sessions) */}
      {activeTab === 'field' && (
        <AdultExplorerPanel
          userId={user?.id || kidsProgressUserId}
          displayHandle={user ? kidsDisplayHandle : null}
          onGoAi={() => setActiveTab('ai')}
          onGoMarket={() => setActiveTab('marketplace')}
        />
      )}

      {/* MARKETPLACE: Gear · Parts (live Supabase listings) */}
      {activeTab === 'marketplace' && (
        <div id="market">
          <MarketLive
            user={user}
            displayHandle={profileHandle}
            onRequestSignIn={() => setShowAuthModal(true)}
          />
        </div>
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
            onSave={handleSaveProfile}
            onClose={() => setShowProfile(false)}
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
          onRequestSignIn={() => setShowAuthModal(true)}
        />
      )}

      <div className="pb-20 md:pb-0">
        <SiteFooter />
      </div>
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
