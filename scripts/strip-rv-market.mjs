import fs from 'fs';

const path = 'components/MarketplaceHub.tsx';
let s = fs.readFileSync(path, 'utf8');

// Drop RV imports that we can
s = s.replace(
  /import \{\r?\n  RvListing,\r?\n  RvClass,\r?\n  RvCondition,\r?\n  RV_CLASS_LABELS,\r?\n  US_MARKET_STATES,\r?\n  formatRvPrice,\r?\n\} from '@\/lib\/rvListings';\r?\n/,
  "import { US_MARKET_STATES } from '@/lib/rvListings';\n"
);
s = s.replace(
  /import \{\r?\n  loadAllListings,\r?\n  saveUserListing,\r?\n  loadUserListingsOnly,\r?\n  removeUserListing,\r?\n  saveListingInterest,\r?\n  markListingSold,\r?\n\} from '@\/lib\/rvMarketplaceStorage';\r?\n/,
  "import { saveListingInterest } from '@/lib/rvMarketplaceStorage';\n"
);
s = s.replace(
  /marketplaceGearImage,\r?\n  marketplacePartsImage,\r?\n  marketplaceRvImageForClass,\r?\n  resolveMarketplaceImage,/,
  'marketplaceGearImage,\n  marketplacePartsImage,\n  resolveMarketplaceImage,'
);

s = s.replace(/type HubView = 'rvs' \| 'gear' \| 'parts' \| 'sell' \| 'mine';/, "type HubView = 'gear' | 'parts' | 'sell' | 'mine';");

// Remove EMPTY_RV
s = s.replace(/const EMPTY_RV = \{[\s\S]*?\};\r?\n\r?\nconst EMPTY_GEAR/, 'const EMPTY_GEAR');

s = s.replace(
  /const \[view, setView\] = useState<HubView>\('rvs'\);\r?\n  const \[sellKind, setSellKind\] = useState<SellKind>\('rv'\);\r?\n  const \[rvs, setRvs\] = useState<RvListing\[\]>\(\[\]\);/,
  "const [view, setView] = useState<HubView>('gear');\n  const [sellKind, setSellKind] = useState<SellKind>('gear');\n"
);
s = s.replace(/const \[rvForm, setRvForm\] = useState\(EMPTY_RV\);\r?\n  /, '');

s = s.replace(/setRvs\(loadAllListings\(\)\);\r?\n    /, '');
s = s.replace(
  /setCredits\(\{\r?\n        rv: countUnusedListingCredits\(user\.id, 'rv'\),\r?\n        gear: countUnusedListingCredits\(user\.id, 'gear'\),\r?\n        parts: countUnusedListingCredits\(user\.id, 'parts'\),\r?\n      \}\);/,
  `setCredits({
        gear: countUnusedListingCredits(user.id, 'gear'),
        parts: countUnusedListingCredits(user.id, 'parts'),
      });`
);
s = s.replace(
  /setCredits\(\{ rv: 0, gear: 0, parts: 0 \}\);/,
  'setCredits({ gear: 0, parts: 0 });'
);
s = s.replace(
  /const \[credits, setCredits\] = useState\(\{ rv: 0, gear: 0, parts: 0 \}\);/,
  'const [credits, setCredits] = useState({ gear: 0, parts: 0 });'
);

s = s.replace(
  /const myRvs = useMemo\(\(\) => \(user \? loadUserListingsOnly\(user\.id\) : \[\]\), \[user, rvs\]\);\r?\n  /,
  ''
);
s = s.replace(
  /const filteredRvs = useMemo\(\(\) => filterActive\(rvs\), \[rvs, search, stateFilter\]\);\r?\n  /,
  ''
);

// Remove publishRv function entirely
s = s.replace(/\n  const publishRv = \(\) => \{[\s\S]*?if \(pts > 0\) toast\.message\(`Road Crew \+\$\{pts\} pts`\);\r?\n  \};\r?\n\r?\n  const publishGear/, '\n  const publishGear');

s = s.replace(/if \(checkout\.itemType === 'rv'\) markListingSold\(checkout\.id, sale\.id\);\r?\n    /, '');

// Header copy
s = s.replace(
  /RVs · Gear · Parts/,
  'Gear · Parts'
);
s = s.replace(
  /Listing software for RVs, gear, and parts\. Seller Pro = unlimited ads\. Buyers contact sellers — no escrow\. Demo until Stripe is live\./,
  'Private-party gear and parts listing software. Seller Pro = unlimited ads. Buyers contact sellers off-platform — no escrow, no vehicle sales. Demo until Stripe is live.'
);

// Tabs
s = s.replace(
  /\[\r?\n            \['rvs', 'RVs', Caravan\],\r?\n            \['gear', 'Gear', Package\],\r?\n            \['parts', 'Parts', Wrench\],\r?\n            \['sell', 'Sell', ShieldCheck\],\r?\n            \['mine', 'Manage listings', List\],\r?\n          \]/,
  `[
            ['gear', 'Gear', Package],
            ['parts', 'Parts', Wrench],
            ['sell', 'Sell', ShieldCheck],
            ['mine', 'Manage listings', List],
          ]`
);

s = s.replace(
  /\(view === 'rvs' \|\| view === 'gear' \|\| view === 'parts'\)/,
  "(view === 'gear' || view === 'parts')"
);

// Remove rvs view block
s = s.replace(
  /\n      \{view === 'rvs' && \(\r?\n        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">[\s\S]*?\n        <\/div>\r?\n      \)\}/,
  ''
);

// Sell kind buttons - no RV
s = s.replace(
  /\[\r?\n                  \['rv', 'RV \/ camper'\],\r?\n                  \['gear', 'Camping gear'\],\r?\n                  \['parts', 'Parts'\],\r?\n                \]/,
  `[
                  ['gear', 'Camping gear'],
                  ['parts', 'Parts'],
                ]`
);

s = s.replace(
  /\{sellKind === 'rv' \? 'RV' : sellKind === 'gear' \? 'Gear' : 'Parts'\}/,
  "{sellKind === 'gear' ? 'Gear' : 'Parts'}"
);

// Remove sellKind === 'rv' form block
s = s.replace(
  /\n              \{sellKind === 'rv' && \(\r?\n                <>[\s\S]*?Publish RV \(demo\)[\s\S]*?<\/>\r?\n              \)\}/,
  ''
);

// Mine - no RVs
s = s.replace(
  /\[\r?\n                \['My RVs', myRvs, removeUserListing, formatRvPrice\] as const,\r?\n                \['My gear', myGear, removeUserGearListing, formatGearPrice\] as const,\r?\n                \['My parts', myParts, removeUserPartsListing, formatPartsPrice\] as const,\r?\n              \]/,
  `[
                ['My gear', myGear, removeUserGearListing, formatGearPrice] as const,
                ['My parts', myParts, removeUserPartsListing, formatPartsPrice] as const,
              ]`
);

// buyCredit toast
s = s.replace(
  /`\$\{t === 'rv' \? 'RV' : t === 'gear' \? 'Gear' : 'Parts'\} listing credit/,
  "`${t === 'gear' ? 'Gear' : 'Parts'} listing credit"
);

// Caravan icon may be unused - keep for now or use Package

fs.writeFileSync(path, s);
console.log('market stripped', s.length);
for (const bad of ["view === 'rvs'", 'publishRv', 'EMPTY_RV', 'myRvs', 'filteredRvs', "sellKind === 'rv'"]) {
  if (s.includes(bad)) console.log('still', bad);
}
