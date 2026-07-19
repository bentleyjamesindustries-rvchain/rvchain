import type { CapacitorConfig } from '@capacitor/cli';

/**
 * v1: WebView loads the live rvchain site (full product parity).
 *
 * Local testing against npm run dev:
 *   1. Find your PC IP (ipconfig → IPv4)
 *   2. Set url to `http://192.168.x.x:3000` and cleartext: true
 *   3. Phone + PC on same Wi‑Fi; firewall allows port 3000
 */
const config: CapacitorConfig = {
  appId: 'com.rvchain.app',
  appName: 'rvchain',
  webDir: 'www',
  server: {
    url: 'https://rv-chain.com',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#14532d',
    },
  },
};

export default config;
