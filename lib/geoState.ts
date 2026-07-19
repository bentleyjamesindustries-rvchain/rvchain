/**
 * Coarse lat/lng → US state (demo quality).
 * Uses bounding boxes + simple overlap priority — good enough for kids trail regions,
 * not for legal/property boundaries.
 */

export type GeoFix = {
  lat: number;
  lng: number;
  accuracyM: number;
};

/** Rough bounding boxes [minLat, maxLat, minLng, maxLng] */
const STATE_BOXES: Array<{ code: string; box: [number, number, number, number] }> = [
  { code: 'CA', box: [32.5, 42.0, -124.5, -114.1] },
  { code: 'OR', box: [41.9, 46.3, -124.6, -116.5] },
  { code: 'WA', box: [45.5, 49.0, -124.8, -116.9] },
  { code: 'NV', box: [35.0, 42.0, -120.0, -114.0] },
  { code: 'AZ', box: [31.3, 37.0, -114.8, -109.0] },
  { code: 'NM', box: [31.3, 37.0, -109.1, -103.0] },
  { code: 'UT', box: [37.0, 42.0, -114.1, -109.0] },
  { code: 'CO', box: [37.0, 41.0, -109.1, -102.0] },
  { code: 'WY', box: [41.0, 45.0, -111.1, -104.1] },
  { code: 'MT', box: [44.4, 49.0, -116.1, -104.0] },
  { code: 'ID', box: [42.0, 49.0, -117.2, -111.0] },
  { code: 'HI', box: [18.9, 22.2, -160.3, -154.8] },
  { code: 'AK', box: [51.2, 71.4, -179.1, -129.9] },
  { code: 'TX', box: [25.8, 36.5, -106.6, -93.5] },
  { code: 'OK', box: [33.6, 37.0, -103.0, -94.4] },
  { code: 'KS', box: [37.0, 40.0, -102.1, -94.6] },
  { code: 'NE', box: [40.0, 43.0, -104.1, -95.3] },
  { code: 'SD', box: [42.5, 45.9, -104.1, -96.4] },
  { code: 'ND', box: [45.9, 49.0, -104.1, -96.6] },
  { code: 'MN', box: [43.5, 49.4, -97.2, -89.5] },
  { code: 'IA', box: [40.4, 43.5, -96.6, -90.1] },
  { code: 'MO', box: [36.0, 40.6, -95.8, -89.1] },
  { code: 'WI', box: [42.5, 47.1, -92.9, -86.8] },
  { code: 'IL', box: [37.0, 42.5, -91.5, -87.0] },
  { code: 'IN', box: [37.8, 41.8, -88.1, -84.8] },
  { code: 'MI', box: [41.7, 48.3, -90.4, -82.1] },
  { code: 'OH', box: [38.4, 42.0, -84.8, -80.5] },
  { code: 'LA', box: [28.9, 33.0, -94.0, -88.8] },
  { code: 'AR', box: [33.0, 36.5, -94.6, -89.6] },
  { code: 'MS', box: [30.2, 35.0, -91.7, -88.1] },
  { code: 'AL', box: [30.2, 35.0, -88.5, -84.9] },
  { code: 'GA', box: [30.4, 35.0, -85.6, -80.8] },
  { code: 'FL', box: [24.5, 31.0, -87.6, -80.0] },
  { code: 'SC', box: [32.0, 35.2, -83.4, -78.5] },
  { code: 'NC', box: [33.8, 36.6, -84.3, -75.5] },
  { code: 'TN', box: [35.0, 36.7, -90.3, -81.6] },
  { code: 'KY', box: [36.5, 39.1, -89.6, -81.9] },
  { code: 'VA', box: [36.5, 39.5, -83.7, -75.2] },
  { code: 'WV', box: [37.2, 40.6, -82.6, -77.7] },
  { code: 'PA', box: [39.7, 42.3, -80.5, -74.7] },
  { code: 'NY', box: [40.5, 45.0, -79.8, -71.9] },
  { code: 'NJ', box: [38.9, 41.4, -75.6, -73.9] },
  { code: 'MD', box: [37.9, 39.7, -79.5, -75.0] },
  { code: 'DE', box: [38.4, 39.8, -75.8, -75.0] },
  { code: 'CT', box: [40.9, 42.1, -73.7, -71.8] },
  { code: 'RI', box: [41.1, 42.0, -71.9, -71.1] },
  { code: 'MA', box: [41.2, 42.9, -73.5, -69.9] },
  { code: 'VT', box: [42.7, 45.0, -73.4, -71.5] },
  { code: 'NH', box: [42.7, 45.3, -72.6, -70.6] },
  { code: 'ME', box: [43.1, 47.5, -71.1, -66.9] },
  { code: 'DC', box: [38.79, 38.995, -77.12, -76.91] },
];

function inBox(lat: number, lng: number, box: [number, number, number, number]): boolean {
  const [minLat, maxLat, minLng, maxLng] = box;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

/** Best-effort state from coordinates. Returns null if outside US boxes. */
export function stateCodeFromLatLng(lat: number, lng: number): string | null {
  let best: { code: string; area: number } | null = null;
  for (const { code, box } of STATE_BOXES) {
    if (!inBox(lat, lng, box)) continue;
    const area = (box[1] - box[0]) * (box[3] - box[2]);
    if (!best || area < best.area) best = { code, area };
  }
  return best?.code ?? null;
}

export function getCurrentPositionOnce(options?: PositionOptions): Promise<GeoFix> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation not supported on this device.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM: pos.coords.accuracy ?? 9999,
        });
      },
      (err) => {
        if (err.code === 1) reject(new Error('Location permission denied.'));
        else if (err.code === 2) reject(new Error('Location unavailable.'));
        else if (err.code === 3) reject(new Error('Location request timed out.'));
        else reject(new Error("Couldn't get your location."));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60_000,
        ...options,
      }
    );
  });
}

export function formatCoords(lat: number, lng: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(3)}°${ns}, ${Math.abs(lng).toFixed(3)}°${ew}`;
}
