# rvchain mobile (Capacitor kickoff)

Shell for Google Play + App Store. Year-1 approach: **Capacitor WebView** loads the live site (or local dev), then native plugins are added over time.

## Prerequisites

- Node 20+
- For Android: Android Studio + SDK
- For iOS: macOS + Xcode + Apple Developer account
- Live site: `https://rv-chain.com` (or your staging URL)

## Scaffold (first time on a machine)

From this `mobile/` folder (or repo root — adjust paths as needed):

```bash
npm create @capacitor/app@latest . -- --name rvchain --app-id com.rvchain.app
# or add Capacitor to an empty package and:
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init rvchain com.rvchain.app
npx cap add android
npx cap add ios
```

### Point the WebView at production

In `capacitor.config.ts`:

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rvchain.app',
  appName: 'rvchain',
  webDir: 'www',
  server: {
    // v1: load live product (full parity without rebundling Next)
    url: 'https://rv-chain.com',
    cleartext: false,
  },
};

export default config;
```

Create a tiny `www/index.html` fallback for offline “open in browser” if the remote URL fails.

### Dev against localhost

```ts
server: {
  url: 'http://YOUR_LAN_IP:3000',
  cleartext: true, // Android only for http
}
```

Phone and PC must be on the same Wi‑Fi; firewall must allow port 3000.

## Build

```bash
npx cap open android   # Android Studio → Run
npx cap open ios       # Xcode → Run / Archive
```

## Recommended plugins (next)

| Plugin | Use |
|--------|-----|
| `@capacitor/status-bar` | Dark UI |
| `@capacitor/splash-screen` | Brand splash |
| `@capacitor/geolocation` | Big Explorer GPS |
| `@capacitor/camera` | Field photos if WebView file input is flaky |
| `@capacitor/app` | Android back button |
| `@capacitor/browser` | External links |

## Store checklist (later)

- Privacy policy URL (family + Big Explorer GPS/photos)
- Icons 1024 / adaptive
- Screenshots
- Age rating (not Kids category until COPPA fully built)
- Little Explorer vs Big Explorer copy in listing

## Status

This folder is the **kickoff docs + config placeholder**. Run the scaffold commands above to generate native projects (they are not committed until you generate them locally to avoid huge binaries in git without `.gitignore`).
