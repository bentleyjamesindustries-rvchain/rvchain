import type { KidsProgress } from './kidsProgress';

/** Contiguous US + AK + HI for Big Explorer passport stamps */
export const PASSPORT_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'Washington DC' },
];

export type StateStamp = {
  code: string;
  name: string;
  findCount: number;
  lastFoundAt: string | null;
  stamped: boolean;
};

/** Count plant finds tagged with a state code (from GPS geo-catch). */
export function getPassportStamps(progress: KidsProgress): StateStamp[] {
  const counts = new Map<string, { n: number; last: string | null }>();
  for (const find of Object.values(progress.finds || {})) {
    const code = find.stateCode?.toUpperCase();
    if (!code) continue;
    const prev = counts.get(code) || { n: 0, last: null };
    const last =
      !prev.last || (find.foundAt && find.foundAt > prev.last) ? find.foundAt : prev.last;
    counts.set(code, { n: prev.n + 1, last });
  }

  return PASSPORT_STATES.map(({ code, name }) => {
    const hit = counts.get(code);
    return {
      code,
      name,
      findCount: hit?.n ?? 0,
      lastFoundAt: hit?.last ?? null,
      stamped: Boolean(hit && hit.n > 0),
    };
  });
}

export function passportSummary(progress: KidsProgress): {
  stamped: number;
  total: number;
  findsWithGps: number;
  pct: number;
} {
  const stamps = getPassportStamps(progress);
  const stamped = stamps.filter((s) => s.stamped).length;
  const findsWithGps = Object.values(progress.finds || {}).filter(
    (f) => f.lat != null && f.lng != null
  ).length;
  const total = PASSPORT_STATES.length;
  return {
    stamped,
    total,
    findsWithGps,
    pct: total ? Math.round((stamped / total) * 100) : 0,
  };
}
