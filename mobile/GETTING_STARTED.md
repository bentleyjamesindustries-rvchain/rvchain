# Get rvchain on your Android phone

## While Android Studio installs

Capacitor is scaffolded in this folder. After install finishes, use the steps below.

## 1. One-time: install Node packages (if not already)

```powershell
cd C:\Users\13152\rvchain\mobile
npm install
npx cap add android
npx cap sync android
```

## 2. Open the project

```powershell
cd C:\Users\13152\rvchain\mobile
npx cap open android
```

Or in Android Studio: **File → Open** → select:

`C:\Users\13152\rvchain\mobile\android`

Wait for Gradle to finish syncing (first time can take several minutes).

## 3. Run on a phone

1. On the phone: **Settings → About phone → tap Build number 7 times**
2. **Developer options → USB debugging → ON**
3. Plug in USB; accept “Allow USB debugging”
4. In Android Studio toolbar: select your device → green **Run** ▶

The app should open and load **https://rv-chain.com**.

## 4. Optional: test against local Next.js

1. On PC: `cd C:\Users\13152\rvchain` then `npm run dev`
2. Run `ipconfig` and note **IPv4** (e.g. `192.168.1.59`)
3. Edit `capacitor.config.ts`:

```ts
server: {
  url: 'http://192.168.1.59:3000',
  cleartext: true,
},
```

4. Then:

```powershell
npx cap sync android
npx cap open android
```

Phone and PC must be on the same Wi‑Fi.

## 5. Later: Play Store internal test

1. Create app in [Play Console](https://play.google.com/console) (~$25)
2. Android Studio → **Build → Generate Signed App Bundle**
3. Upload AAB to **Internal testing**
4. Add your Gmail as tester

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Device not listed | USB drivers, try another cable, enable File Transfer |
| Blank white screen | Check `server.url` is reachable from the phone browser |
| Gradle errors | Android Studio → SDK Manager → install latest SDK + Build-Tools |
| `cap` not found | `cd mobile` then `npx cap ...` |
| `prepareKotlinBuildScriptModel` not found | Already fixed in `android/app/build.gradle`. In Studio: **File → Sync Project with Gradle Files** |

