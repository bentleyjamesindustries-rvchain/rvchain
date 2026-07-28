import fs from 'fs';

const path = 'app/page.tsx';
let s = fs.readFileSync(path, 'utf8');

s = s.replace(/const MapView = dynamic\([\s\S]*?\);\r?\n\r?\n/, '');
s = s.replace(/import \{ Park, calculateDistance \} from '@\/lib\/parks';\r?\n/, '');
s = s.replace(/import \{ LOCAL_PARK_CATALOG, CATALOG_STATES \} from '@\/lib\/parkCatalog';\r?\n/, '');
s = s.replace(
  /import \{ supabase, Park as SupabasePark \} from '@\/lib\/supabaseClient';\r?\n/,
  "import { supabase } from '@/lib/supabaseClient';\n"
);
s = s.replace(
  /import \{ listLocalTrips, addLocalTripPark \} from '@\/lib\/localTrips';\r?\n/,
  "import { listLocalTrips } from '@/lib/localTrips';\n"
);
s = s.replace(/import dynamic from 'next\/dynamic';\r?\n/, '');
s = s.replace(/import VerifiedBadge from '@\/components\/VerifiedBadge';\r?\n/, '');
s = s.replace(
  /import \{ createModeratorVerification, getParkVerificationInfo \} from '@\/lib\/spotVerification';\r?\n/,
  ''
);
s = s.replace(/import \{ isModerator \} from '@\/lib\/moderator';\r?\n/, '');
s = s.replace(/import \{ enrichParks \} from '@\/lib\/localVerification';\r?\n/, '');
s = s.replace(
  /import \{ DEFAULT_SPOT_IMAGE, SPOT_IMAGES, isLocalGrokAsset \} from '@\/lib\/spotImages';\r?\n/,
  ''
);
s = s.replace(/import \{ canUseTripPlanner \} from '@\/lib\/membershipPlans';\r?\n/, '');
s = s.replace(/import \{ awardRoadCrewForUser \} from '@\/lib\/roadCrew';\r?\n/, '');

s = s.replace(
  /MapPin, Navigation, Heart, User, Search, X, Star, \r?\n  MessagesSquare, Compass, LogIn, Plus, Calendar, Gift, Eye, EyeOff, Caravan, Sparkles, Baby, Leaf/,
  'MessagesSquare, Compass, LogIn, Calendar, Gift, Eye, EyeOff, Caravan, Sparkles, Baby, Leaf'
);

s = s.replace(
  /type Tab =\r?\n  \| 'home'\r?\n  \| 'discover'\r?\n  \| 'kids'\r?\n  \| 'field'\r?\n  \| 'marketplace'\r?\n  \| 'map'\r?\n  \| 'community'\r?\n  \| 'trips'\r?\n  \| 'rewards';/,
  `type Tab =
  | 'home'
  | 'kids'
  | 'field'
  | 'marketplace'
  | 'community'
  | 'trips'
  | 'rewards'`
);

s = s.replace(/const STATES = CATALOG_STATES;\r?\n\r?\n/, '');

s = s.replace(
  /const NAV_TABS: \{ id: Tab; label: string; icon: LucideIcon \}\[\] = \[[\s\S]*?\];/,
  `const NAV_TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: Compass },
  { id: 'marketplace', label: 'Market', icon: Caravan },
  { id: 'kids', label: 'Little Explorer', icon: Sparkles },
  { id: 'field', label: 'Big Explorer', icon: Leaf },
  { id: 'community', label: 'Forum', icon: MessagesSquare },
  { id: 'trips', label: 'Trips', icon: Calendar },
  { id: 'rewards', label: 'Crew', icon: Gift },
];`
);

// Remove spot filter / park state blocks
s = s.replace(
  /\n  \/\/ Spot filters[\s\S]*?const \[selectedState, setSelectedState\] = useState\(''\);\r?\n/,
  '\n'
);
s = s.replace(/\n  const \[userLocation, setUserLocation\] = useState[^\n]+\r?\n/, '\n');
s = s.replace(/\n  const \[favorites, setFavorites\] = useState[^\n]+\r?\n/, '\n');
s = s.replace(/\n  \/\/ Supabase data[\s\S]*?const \[dbParks, setDbParks\] = useState[^\n]+\r?\n/, '\n');
s = s.replace(/\n  const \[selectedPark, setSelectedPark\] = useState[^\n]+\r?\n/, '\n');
s = s.replace(/\n  const \[showSubmitPark, setShowSubmitPark\] = useState[^\n]+\r?\n/, '\n');
s = s.replace(/\n  const \[verifyingParkId, setVerifyingParkId\] = useState[^\n]+\r?\n/, '\n');
s = s.replace(/\n  \/\/ Submit park form[\s\S]*?image: ''\r?\n  \}\);\r?\n/, '\n');

// favorites localStorage
s = s.replace(
  /\n    const savedFavorites = localStorage\.getItem\('rvchain_favorites'\);\r?\n    if \(savedFavorites\) setFavorites\(JSON\.parse\(savedFavorites\)\);\r?\n/,
  '\n'
);
s = s.replace(
  /\n  \/\/ Persist favorites and handle\r?\n  useEffect\(\(\) => \{\r?\n    localStorage\.setItem\('rvchain_favorites', JSON\.stringify\(favorites\)\);\r?\n  \}, \[favorites\]\);\r?\n/,
  '\n'
);

// Fetch parks effect
s = s.replace(/\n  \/\/ Fetch parks from Supabase[\s\S]*?\}, \[\]\);\r?\n/, '\n');

// filteredParks through useMyLocation
s = s.replace(
  /\n  \/\/ Community spots[\s\S]*?const clearFilters = \(\) => \{[\s\S]*?\};\r?\n\r?\n  const useMyLocation = \(\) => \{[\s\S]*?\};\r?\n/,
  '\n'
);

// getDirections through isFavorite
s = s.replace(
  /\n  const getDirections = \(park: Park\) => \{[\s\S]*?const isFavorite = \(parkId: string\) => favorites\.includes\(parkId\);\r?\n/,
  '\n'
);

// Spot submission through addParkToTripFromDiscover
s = s.replace(
  /\n  \/\/ === SPOT SUBMISSION ===[\s\S]*?toast\.success\(`Added to "\$\{trip\.title\}"`\);\r?\n    setActiveTab\('trips'\);\r?\n  \};\r?\n/,
  '\n'
);

s = s.replace(
  /\n  const removeFavorite = \(parkId: string\) => \{[\s\S]*?\};\r?\n\r?\n  const allParks[\s\S]*?const favoritedParks = allParks\.filter\(\(p\) => favorites\.includes\(p\.id\)\);\r?\n\r?\n  \/\/ Stats\r?\n  const totalParks = allParks\.length;\r?\n  const connectedRVers = "28,419";\r?\n/,
  '\n  const connectedRVers = "28,419";\n'
);

// Hero section
s = s.replace(
  /\{\/\* Hero[\s\S]*?\(\!isMobile \|\| activeTab === 'discover'\) && \(\r?\n      <div className="rv-hero[\s\S]*?<\/div>\r?\n      \)\}\r?\n/,
  `{/* Hero — market-first; compact on mobile home only */}
      {(!isMobile || activeTab === 'home') && (
      <div className="rv-hero max-w-screen-xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-y-3">
          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tighter">Gear. Parts.<br className="hidden sm:block" /><span className="sm:hidden"> </span>Family on the road.</h1>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-lg text-slate-100 max-w-md [text-shadow:0_1px_3px_rgb(15_23_42/0.75)]">Private-party gear &amp; parts board — not a campground directory, not a vehicle dealer.</p>
          </div>
          <div className="flex flex-col min-[400px]:flex-row items-stretch sm:items-center gap-2 sm:gap-x-3 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('marketplace')}
              className="flex items-center justify-center gap-x-2 px-4 sm:px-5 h-11 bg-white text-slate-900 hover:bg-amber-50 active:bg-white font-semibold rounded-3xl transition text-sm shadow-sm"
            >
              <Caravan className="w-4 h-4 shrink-0" />
              <span>Open Market</span>
            </button>
          </div>
        </div>
      </div>
      )}
`
);

// Kids/field stateCode
s = s.replace(/stateCode=\{selectedState \|\| null\}/g, 'stateCode={null}');

// Remove discover block
s = s.replace(
  /\n      \{\/\* COMMUNITY SPOTS[\s\S]*?\n      \{\/\* MARKETPLACE: RVs · Gear · Parts \*\/\}/,
  '\n      {/* MARKETPLACE: Gear · Parts */}'
);

// Remove map block
s = s.replace(
  /\n      \{\/\* MAP \*\/\}[\s\S]*?\n      \{\/\* FORUM \*\/\}/,
  '\n      {/* FORUM */}'
);

// Remove park detail modal
s = s.replace(
  /\n      \{\/\* Park Detail Modal \*\/\}[\s\S]*?\n      \{\/\* Profile editor \*\/\}/,
  '\n      {/* Profile editor */}'
);

// ProfileEditor props
s = s.replace(
  /favoritesCount=\{favorites\.length\}\r?\n            favoritedParks=\{favoritedParks\}\r?\n            onSave=\{handleSaveProfile\}\r?\n            onClose=\{\(\) => setShowProfile\(false\)\}\r?\n            onParkSelect=\{\(park\) => \{ showParkDetails\(park\); setShowProfile\(false\); \}\}\r?\n            onRemoveFavorite=\{removeFavorite\}\r?\n/,
  `favoritesCount={0}
            favoritedParks={[]}
            onSave={handleSaveProfile}
            onClose={() => setShowProfile(false)}
            onParkSelect={() => {}}
            onRemoveFavorite={() => {}}
`
);

// Submit park modal
s = s.replace(
  /\n      \{\/\* Submit Park Modal[\s\S]*?\n      \{\/\* REWARDS TAB \*\/\}/,
  '\n      {/* REWARDS TAB */}'
);

// Trips props
s = s.replace(
  /<TripPlannerPanel\r?\n          user=\{user\}\r?\n          allParks=\{allParks\}\r?\n          quickAddParks=\{filteredParks\}\r?\n          onRequestSignIn=\{\(\) => setShowAuthModal\(true\)\}\r?\n        \/>/,
  `<TripPlannerPanel
          user={user}
          onRequestSignIn={() => setShowAuthModal(true)}
        />`
);

// Footer
s = s.replace(
  /Demonstration only — memberships, Seller Pro, rewards, and listings are simulated on your device\. No real charges or seller notifications\./,
  'Demo — private-party gear & parts board. Listing tools and memberships are simulated until live billing. Not a campground directory or vehicle dealer.'
);

fs.writeFileSync(path, s);
console.log('stripped page.tsx', s.length);
// sanity checks
for (const bad of ['discover', 'MapView', 'dbParks', 'selectedPark', 'LOCAL_PARK', 'filteredParks', 'showSubmitPark']) {
  if (s.includes(bad)) console.log('still has', bad);
}
