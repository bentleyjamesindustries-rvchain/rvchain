import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dst = path.join(__dirname, '../public/kids/badges');

const slugs = [
  'badge-001-campfire-fox', 'badge-002-chipmunk-scout', 'badge-003-trail-rabbit', 'badge-004-lake-trout', 'badge-005-forest-deer',
  'badge-006-raccoon-raider', 'badge-007-firefly-field', 'badge-008-pond-turtle', 'badge-009-canyon-bat', 'badge-010-prairie-hawk',
  'badge-011-stream-heron', 'badge-012-mountain-goat', 'badge-013-beaver-builder', 'badge-014-coyote-song', 'badge-015-bear-cub',
  'badge-016-bald-eagle', 'badge-017-moose-morning', 'badge-018-bighorn-ridge', 'badge-019-pine-trail', 'badge-020-river-bend',
  'badge-021-prairie-sunset', 'badge-022-desert-mesa', 'badge-023-coastal-fog', 'badge-024-alpine-lake', 'badge-025-red-rock',
  'badge-026-waterfall-veil', 'badge-027-snowy-pass', 'badge-028-deep-canyon', 'badge-029-starry-camp', 'badge-030-mountain-peak',
  'badge-031-cozy-tent', 'badge-032-warm-lantern', 'badge-033-trail-backpack', 'badge-034-camp-compass', 'badge-035-trail-marker',
  'badge-036-binocular-view', 'badge-037-campfire-glow', 'badge-038-marshmallow-roast', 'badge-039-forest-hammock', 'badge-040-quiet-canoe',
  'badge-041-rv-silhouette', 'badge-042-trail-map', 'badge-043-northern-lights', 'badge-044-moon-ridge', 'badge-045-thunderhead',
  'badge-046-golden-eagle-myth', 'badge-047-ancient-sequoia', 'badge-048-desert-bloom', 'badge-049-new-green-trail', 'badge-050-open-road',
];

const colors = ['#4ade80', '#38bdf8', '#fbbf24', '#a78bfa', '#fb923c', '#34d399', '#60a5fa', '#f472b6'];

fs.mkdirSync(dst, { recursive: true });

let svgMade = 0;
slugs.forEach((s, i) => {
  const png = path.join(dst, `${s}.png`);
  if (fs.existsSync(png)) return;
  const c = colors[i % colors.length];
  const num = s.slice(6, 9);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="g" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <circle cx="256" cy="240" r="160" fill="none" stroke="${c}" stroke-width="12" opacity="0.9"/>
  <circle cx="256" cy="240" r="140" fill="#0f172a" stroke="${c}" stroke-width="4" opacity="0.5"/>
  <text x="256" y="255" text-anchor="middle" font-family="system-ui,sans-serif" font-size="72" font-weight="700" fill="${c}">${num}</text>
  <text x="256" y="420" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" fill="#94a3b8">Trail Badge</text>
</svg>`;
  fs.writeFileSync(path.join(dst, `${s}.svg`), svg);
  // also copy as .png path won't work - use svg as fallback path in code
  svgMade++;
});

const pngs = fs.readdirSync(dst).filter((f) => f.endsWith('.png')).length;
const svgs = fs.readdirSync(dst).filter((f) => f.endsWith('.svg')).length;
console.log({ pngs, svgs, svgMade });
