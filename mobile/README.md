# rvchain mobile (Capacitor)

Android project is generated under `android/`. App loads **https://rv-chain.com** in a WebView.

## After Android Studio finishes installing

1. Open this project in Android Studio:

```powershell
cd C:\Users\13152\rvchain\mobile
npx cap open android
```

Or: **File → Open** → `C:\Users\13152\rvchain\mobile\android`

2. Wait for **Gradle sync** (first time can take 5–15 minutes).

3. Plug in phone with **USB debugging** on, or start an emulator.

4. Press green **Run** ▶

Full walkthrough: [GETTING_STARTED.md](./GETTING_STARTED.md)

## Re-sync after config changes

```powershell
cd C:\Users\13152\rvchain\mobile
npx cap sync android
```

## Local web app instead of production

Edit `capacitor.config.ts` `server.url` to `http://YOUR_PC_IP:3000` and `cleartext: true`, then sync again.
