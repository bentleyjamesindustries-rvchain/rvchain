# -*- coding: utf-8 -*-
from pathlib import Path

root = Path(__file__).resolve().parents[1]

# --- AdultExplorerPanel ---
p = root / "components" / "AdultExplorerPanel.tsx"
t = p.read_text(encoding="utf-8")

old_howto = """        <div className=\"rounded-3xl border border-slate-600 bg-slate-900/90 p-6 space-y-3 text-sm text-slate-100\">
          <h2 className=\"text-xl font-bold text-white\">How Trail Log works</h2>
          <ol className=\"list-decimal pl-5 space-y-2 leading-relaxed\">
            <li>
              <strong className=\"text-white\">Log a ride</strong> — pick camper, off-road truck, ATV,
              dirt bike, or snowmobile.
            </li>
            <li>
              <strong className=\"text-white\">Optional GPS</strong> — pins location and stamps your
              state passport.
            </li>
            <li>
              <strong className=\"text-white\">Optional photo</strong> — trail, mud, snow, or rig shot
              for your private history.
            </li>
            <li>
              <strong className=\"text-white\">Earn badges</strong> and open Trailhead AI for pre-ride
              checklists or Market for gear.
            </li>
          </ol>
          <p className=\"text-xs text-slate-400 pt-2\">
            Kids play in Little Explorer without GPS or photo logging. Keep Trail Log for adult
            accounts.
          </p>
        </div>"""

new_howto = """        <div className=\"rounded-3xl border border-slate-600 bg-slate-900/90 p-6 space-y-3 text-sm text-slate-100\">
          <h2 className=\"text-xl font-bold text-white\">{t('trailLog.howtoTitle')}</h2>
          <ol className=\"list-decimal pl-5 space-y-2 leading-relaxed\">
            <li>{t('trailLog.howto1')}</li>
            <li>{t('trailLog.howto2')}</li>
            <li>{t('trailLog.howto3')}</li>
            <li>{t('trailLog.howto4')}</li>
          </ol>
          <p className=\"text-xs text-slate-400 pt-2\">{t('trailLog.howtoNote')}</p>
        </div>"""

assert old_howto in t, "howto block not found"
t = t.replace(old_howto, new_howto)

t = t.replace(
    "toast.success('Location pinned for this log')",
    "toast.success(t('trailLog.locPinned'))",
)
t = t.replace(
    "toast.error('Could not process photo')",
    "toast.error(t('trailLog.photoFail'))",
)
t = t.replace(
    "toast.error('Could not save log')",
    "toast.error(t('trailLog.saveFail'))",
)

# back buttons
t = t.replace("← Back", "{t('common.back')}")
t = t.replace(
    '<ChevronLeft className="w-4 h-4" /> Back',
    "<ChevronLeft className=\"w-4 h-4\" /> {t('common.back')}",
)
t = t.replace(
    '<ChevronLeft className="w-4 h-4" /> Cancel',
    "<ChevronLeft className=\"w-4 h-4\" /> {t('common.cancel')}",
)

# passport
t = t.replace(
    "Road &amp; trail passport",
    "{t('trailLog.passportTitle')}",
)
t = t.replace(
    """          <p className="text-sm text-slate-200 mt-1">
            Stamp states when you log a ride with GPS. Fill the map as you travel.
          </p>""",
    """          <p className="text-sm text-slate-200 mt-1">
            {t('trailLog.passportSub')}
          </p>""",
)
t = t.replace(
    "              {summary.stamped} / {summary.total} states",
    "              {t('trailLog.statesCount', { n: summary.stamped, total: summary.total })}",
)
t = t.replace(
    "              {summary.withGps} GPS logs",
    "              {t('trailLog.gpsLogs', { n: summary.withGps })}",
)
t = t.replace(
    "              {summary.pct}% complete",
    "              {t('trailLog.pctComplete', { n: summary.pct })}",
)
t = t.replace(
    "              Log a ride with GPS →",
    "              {t('trailLog.logWithGps')}",
)

t = t.replace(
    '<h2 className="text-xl font-bold text-white">Trail badges</h2>',
    '<h2 className="text-xl font-bold text-white">{t(\'trailLog.badgesTitle\')}</h2>',
)
t = t.replace(
    '<h2 className="text-xl font-bold text-white">Ride history</h2>',
    '<h2 className="text-xl font-bold text-white">{t(\'trailLog.historyTitle\')}</h2>',
)
t = t.replace(
    "No logs yet. Start your first ride log.",
    "{t('trailLog.historyEmpty')}",
)

# log form
t = t.replace(
    "{view === 'active' ? 'Active log' : 'Log a ride'}",
    "{view === 'active' ? t('trailLog.activeLog') : t('trailLog.logRide')}",
)
t = t.replace(
    """          <p className="text-sm text-slate-300">
            Pick your recreational vehicle. GPS and photo are optional.
          </p>""",
    """          <p className="text-sm text-slate-300">
            {t('trailLog.pickVehicle')}
          </p>""",
)

# vehicle labels - map via helper
if "const vehicleLabelI18n" not in t:
    t = t.replace(
        "  const name = displayHandle?.trim() || 'Explorer';",
        """  const name = displayHandle?.trim() || 'Explorer';
  const vehicleLabelI18n = (id: string) => {
    const map: Record<string, string> = {
      camper: t('trailLog.vCamper'),
      'offroad-truck': t('trailLog.vTruck'),
      atv: t('trailLog.vAtv'),
      'dirt-bike': t('trailLog.vDirt'),
      snowmobile: t('trailLog.vSnow'),
      other: t('trailLog.vOther'),
    };
    return map[id] || id;
  };
""",
    )
t = t.replace(
    """                <span className="mr-1.5">{v.emoji}</span>
                {v.label}""",
    """                <span className="mr-1.5">{v.emoji}</span>
                {vehicleLabelI18n(v.id)}""",
)

t = t.replace(
    '<Play className="w-4 h-4" /> Start log',
    "<Play className=\"w-4 h-4\" /> {t('trailLog.startLog')}",
)
t = t.replace(
    "{gpsBusy ? 'Getting GPS…' : lat != null ? 'GPS pinned' : 'Pin GPS'}",
    "{gpsBusy ? t('trailLog.gettingGps') : lat != null ? t('trailLog.gpsPinned') : t('trailLog.pinGps')}",
)
t = t.replace(
    "{photo ? 'Photo added' : 'Add photo'}",
    "{photo ? t('trailLog.photoAdded') : t('trailLog.addPhoto')}",
)
t = t.replace(
    'placeholder="Optional note — muddy trail, first snow, long tow day…"',
    "placeholder={t('trailLog.notePh')}",
)
t = t.replace(
    "{saving ? 'Saving…' : 'End & save log'}",
    "{saving ? t('trailLog.saving') : t('trailLog.endSave')}",
)
t = t.replace(
    "Started {startedAt ? new Date(startedAt).toLocaleTimeString() : '—'}",
    "{t('trailLog.started', { time: startedAt ? new Date(startedAt).toLocaleTimeString() : '—' })}",
)

# hub
t = t.replace(
    """        <p className="mt-3 text-sm font-semibold text-sky-100">
          {stats.sessions} session{stats.sessions === 1 ? '' : 's'} · {stats.states} states ·{' '}
          {stats.badges}/{stats.badgeTotal} badges · {stats.vehiclesUsed} vehicle type
          {stats.vehiclesUsed === 1 ? '' : 's'}
        </p>""",
    """        <p className="mt-3 text-sm font-semibold text-sky-100">
          {t('trailLog.statsLine', {
            sessions: stats.sessions,
            states: stats.states,
            badges: stats.badges,
            badgeTotal: stats.badgeTotal,
            vehicles: stats.vehiclesUsed,
          })}
        </p>""",
)
t = t.replace(
    '<Play className="w-5 h-5" /> Log a ride',
    "<Play className=\"w-5 h-5\" /> {t('trailLog.logRide')}",
)
t = t.replace(
    """          <div className="text-lg font-bold text-white">Passport</div>
          <p className="text-sm text-slate-300 mt-1">Stamp states with GPS logs</p>""",
    """          <div className="text-lg font-bold text-white">{t('trailLog.passport')}</div>
          <p className="text-sm text-slate-300 mt-1">{t('trailLog.passportDesc')}</p>""",
)
t = t.replace(
    """          <div className="text-lg font-bold text-white">Badges</div>
          <p className="text-sm text-slate-300 mt-1">
            {stats.badges}/{stats.badgeTotal} trail badges
          </p>""",
    """          <div className="text-lg font-bold text-white">{t('trailLog.badges')}</div>
          <p className="text-sm text-slate-300 mt-1">
            {t('trailLog.badgesCount', { n: stats.badges, total: stats.badgeTotal })}
          </p>""",
)
t = t.replace(
    """          <div className="text-lg font-bold text-white">History</div>
          <p className="text-sm text-slate-300 mt-1">Past rides &amp; notes</p>""",
    """          <div className="text-lg font-bold text-white">{t('trailLog.history')}</div>
          <p className="text-sm text-slate-300 mt-1">{t('trailLog.historyDesc')}</p>""",
)
t = t.replace(
    """            <div className="text-sm font-bold text-white">Pre-ride with Trailhead AI</div>
            <div className="text-xs text-slate-400">Checklists &amp; trip plans</div>""",
    """            <div className="text-sm font-bold text-white">{t('trailLog.preRideAi')}</div>
            <div className="text-xs text-slate-400">{t('trailLog.preRideAiDesc')}</div>""",
)
t = t.replace(
    """            <div className="text-sm font-bold text-white">Need gear?</div>
            <div className="text-xs text-slate-400">Browse Market parts &amp; gear</div>""",
    """            <div className="text-sm font-bold text-white">{t('trailLog.needGear')}</div>
            <div className="text-xs text-slate-400">{t('trailLog.needGearDesc')}</div>""",
)
t = t.replace(
    "How it works &amp; privacy",
    "{t('trailLog.howWorks')}",
)

p.write_text(t, encoding="utf-8")
print("AdultExplorerPanel patched")

# --- KidsAdventurePanel ---
p = root / "components" / "KidsAdventurePanel.tsx"
t = p.read_text(encoding="utf-8")

t = t.replace("← Back", "{t('common.back')}")

old_kids_howto = """        <div className=\"rounded-3xl border border-slate-700 bg-slate-900/80 p-6 space-y-4\">
          <h2 className=\"text-xl font-bold text-white\">Little Explorer — privacy first</h2>
          <ul className=\"list-disc pl-5 space-y-2 text-sm text-slate-300 leading-relaxed\">
            <li>
              <strong className=\"text-white\">No GPS</strong> — we never request location here.
            </li>
            <li>
              <strong className=\"text-white\">No camera logging</strong> — no field photos are saved.
            </li>
            <li>
              <strong className=\"text-white\">No accounts</strong> — play without signing in as a
              child.
            </li>
            <li>
              <strong className=\"text-white\">Field guide</strong> — learn plant facts with a grown-up
              outdoors (look only).
            </li>
            <li>
              <strong className=\"text-white\">Games</strong> — fun trail mini-games. Optional high
              scores use an anonymous device key, not a child profile.
            </li>
          </ul>
          <div className=\"rounded-2xl border border-sky-800/40 bg-sky-950/30 p-4 text-xs text-sky-100/90 leading-relaxed\">
            <p className=\"font-semibold text-sky-200 mb-1\">Grown-ups nearby\\?</p>
            <p>
              Grown-ups use the <strong>Trail Log</strong> tab (18+) to log rides and road trips. Keep kids in Little Explorer.
            </p>
          </div>
        </div>"""

# file may have Grown-ups nearby? without backslash
if "Grown-ups nearby" not in t:
    print("kids howto pattern check", "privacy first" in t)
else:
    # simpler replacements
    t = t.replace(
        "Little Explorer — privacy first",
        "{t('kids.privacyTitle')}",
    )
    t = t.replace(
        """              <strong className="text-white">No GPS</strong> — we never request location here.""",
        "{t('kids.noGps')}",
    )
    t = t.replace(
        """              <strong className="text-white">No camera logging</strong> — no field photos are saved.""",
        "{t('kids.noCamera')}",
    )
    t = t.replace(
        """              <strong className="text-white">No accounts</strong> — play without signing in as a
              child.""",
        "{t('kids.noAccounts')}",
    )
    t = t.replace(
        """              <strong className="text-white">Field guide</strong> — learn plant facts with a grown-up
              outdoors (look only).""",
        "{t('kids.guideLi')}",
    )
    t = t.replace(
        """              <strong className="text-white">Games</strong> — fun trail mini-games. Optional high
              scores use an anonymous device key, not a child profile.""",
        "{t('kids.gamesLi')}",
    )
    t = t.replace(
        "Grown-ups nearby\\?",
        "{t('kids.grownupsTitle')}",
    )
    t = t.replace(
        "Grown-ups nearby?",
        "{t('kids.grownupsTitle')}",
    )
    t = t.replace(
        """              Grown-ups use the <strong>Trail Log</strong> tab (18+) to log rides and road trips. Keep kids in Little Explorer.""",
        "{t('kids.grownupsBody')}",
    )

t = t.replace(
    """        <p>
          <strong className="text-sky-200">Privacy:</strong> no location, no camera saves, no child
          accounts here. Adults log rides in <strong>Trail Log</strong>.
        </p>""",
    """        <p>{t('kids.privacyBanner')}</p>""",
)
t = t.replace(
    """          <div className="text-lg font-bold text-white">Field guide</div>
          <p className="text-sm text-slate-400 mt-1">Learn plants — look only, nothing is saved</p>""",
    """          <div className="text-lg font-bold text-white">{t('kids.fieldGuide')}</div>
          <p className="text-sm text-slate-400 mt-1">{t('kids.fieldGuideDesc')}</p>""",
)
t = t.replace(
    """          <div className="text-lg font-bold text-white">Games</div>
          <p className="text-sm text-slate-400 mt-1">Trail Run, Tree Climb, Marshmallow Catch</p>""",
    """          <div className="text-lg font-bold text-white">{t('kids.games')}</div>
          <p className="text-sm text-slate-400 mt-1">{t('kids.gamesDesc')}</p>""",
)
t = t.replace(
    "How Little Explorer works & privacy",
    "{t('kids.howPrivacy')}",
)

p.write_text(t, encoding="utf-8")
print("KidsAdventurePanel patched")

# --- MarketplaceDisclosure ---
p = root / "components" / "MarketplaceDisclosure.tsx"
p.write_text(
    """'use client';

import { Info } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export default function MarketplaceDisclosure({ compact }: { compact?: boolean }) {
  const { t } = useI18n();
  const bullets = [
    t('market.discB1'),
    t('market.discB2'),
    t('market.discB3'),
    t('market.discB4'),
    t('market.discB5'),
    t('market.discB6'),
    t('market.discB7'),
  ];
  return (
    <section
      className={`bg-slate-900/80 border border-slate-700/80 rounded-3xl ${compact ? 'p-4' : 'p-5 sm:p-6'}`}
      aria-labelledby="marketplace-disclosure-title"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center shrink-0">
          <Info className="w-4 h-4 text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 id="marketplace-disclosure-title" className="font-semibold text-slate-200 text-sm">
            {t('market.discTitle')}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{t('market.discSummary')}</p>
          {!compact && (
            <ul className="mt-2 space-y-1.5 text-[11px] sm:text-xs text-slate-500 leading-relaxed list-disc pl-4">
              {bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          <p className="text-[10px] text-slate-600 mt-3 border-t border-slate-800 pt-2">
            {t('market.discFooter')}
          </p>
        </div>
      </div>
    </section>
  );
}
""",
    encoding="utf-8",
)
print("MarketplaceDisclosure patched")

# --- MarketLive common strings ---
p = root / "components" / "MarketLive.tsx"
t = p.read_text(encoding="utf-8")
t = t.replace("return toast.error('Title required')", "return toast.error(t('market.titleRequired'))")
t = t.replace("return toast.error('Valid price required')", "return toast.error(t('market.priceRequired'))")
t = t.replace(
    "return toast.error('City and state required')",
    "return toast.error(t('market.cityStateRequired'))",
)
t = t.replace(
    "return toast.error('Add an email or phone so buyers can contact you')",
    "return toast.error(t('market.contactRequired'))",
)
t = t.replace("toast.success('Listing updated')", "toast.success(t('market.listingUpdated'))")
t = t.replace("toast.success('Listing published')", "toast.success(t('market.listingPublished'))")
t = t.replace("toast.success('Listing removed')", "toast.success(t('market.listingRemoved'))")
t = t.replace("if (!confirm('Remove this listing?')) return;", "if (!confirm(t('market.removeConfirm'))) return;")
t = t.replace(
    "? 'Seller Pro'",
    "? t('market.sellerPro')",
)
t = t.replace(
    "Sign in to list →",
    "{t('market.signInToList')}",
)
t = t.replace(
    "{editingId ? 'Edit listing' : 'New listing'}",
    "{editingId ? t('market.editListing') : t('market.newListing')}",
)
t = t.replace(
    "{k === 'gear' ? 'Camping gear' : 'Parts'}",
    "{k === 'gear' ? t('market.campingGear') : t('market.parts')}",
)
t = t.replace('placeholder="Title"', "placeholder={t('market.titleField')}")
t = t.replace(
    'placeholder="Description — condition notes, what’s included…"',
    "placeholder={t('market.descPh')}",
)
# curly apostrophe variants
t = t.replace(
    'placeholder="Description — condition notes, what\'s included…"',
    "placeholder={t('market.descPh')}",
)
t = t.replace('placeholder="Price $"', "placeholder={t('market.pricePh')}")

# condition labels in select
old_cond = """                  {(Object.entries(CONDITION_LABELS) as [MarketCondition, string][]).map(
                    ([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    )
                  )}"""
new_cond = """                  {(
                    [
                      ['new', 'market.condNew'],
                      ['like-new', 'market.condLikeNew'],
                      ['good', 'market.condGood'],
                      ['fair', 'market.condFair'],
                      ['for-parts', 'market.condParts'],
                    ] as const
                  ).map(([k, key]) => (
                      <option key={k} value={k}>
                        {t(key)}
                      </option>
                    ))}"""
if old_cond in t:
    t = t.replace(old_cond, new_cond)
    print("condition labels ok")
else:
    print("condition labels pattern miss")

t = t.replace(
    """                        View
                      </button>""",
    """                        {t('market.view')}
                      </button>""",
)

# contact seller if present
t = t.replace("Contact seller", "{t('market.contactSeller')}")

p.write_text(t, encoding="utf-8")
print("MarketLive patched")

# --- page.tsx chrome ---
p = root / "app" / "page.tsx"
t = p.read_text(encoding="utf-8")
t = t.replace(
    "FAMILY ROAD LIFE",
    "{t('chrome.familyRoadLife')}",
)
t = t.replace(
    """                <span><span className="font-semibold text-white">{connectedRVers}</span> RVers connected</span>""",
    """                <span>{t('chrome.rversConnected', { n: connectedRVers })}</span>""",
)
t = t.replace(
    """                <span className="text-amber-300/80 text-[10px] sm:text-xs hidden min-[380px]:inline">crew</span>""",
    """                <span className="text-amber-300/80 text-[10px] sm:text-xs hidden min-[380px]:inline">{t('chrome.crewPts')}</span>""",
)
t = t.replace(
    """                    Exit
                  </button>""",
    """                    {t('common.exit')}
                  </button>""",
)
t = t.replace(
    "toast.success('Explorer signed out')",
    "toast.success(t('chrome.explorerSignedOut'))",
)
p.write_text(t, encoding="utf-8")
print("page.tsx patched")

print("ALL DONE")
