# Kids Games mobile fix (ready to ship)

## Problem review (why phone play failed)

| Issue | Impact |
|--------|--------|
| Character picker / game-over UI as **absolute overlay** inside `overflow: hidden` + `max-height: 70vh` | Play / Jump buttons clipped or off-screen on phones |
| Canvas only, no big **on-screen buttons** | Tree Climb / Marshmallow relied on awkward screen regions or drag that iOS scroll often stole |
| Missing `touch-action: none` / weak pointer capture | Page scrolls instead of game input |
| Jump intent cleared same frame if airborne | Trail Run taps “missed” jumps |
| Fixed **mobile bottom nav** (`pb-24`) covering controls | Buttons hard to reach |

## Fix already implemented (local, uncommitted)

Build passed (`npm run build` clean). Changes:

1. **[MobileGameControls.tsx](components/kids-games/MobileGameControls.tsx)** (new)  
   - Large `HoldButton` / `TapButton` with `setPointerCapture` (iOS-friendly)

2. **CSS + shell** — [globals.css](app/globals.css), [GameShell.tsx](components/kids-games/GameShell.tsx)  
   - Remove stage clipping; canvas max-height ~48vh phone / 60vh desktop  
   - `touch-action: none` on canvas  
   - Extra bottom padding so controls clear mobile nav  

3. **Trail Run** — [TrailRunGame.tsx](components/kids-games/TrailRunGame.tsx)  
   - Picker **below** canvas (not overlay)  
   - Big **JUMP** bar while playing  
   - ~10-frame jump buffer  

4. **Tree Climb** — [TreeClimbGame.tsx](components/kids-games/TreeClimbGame.tsx)  
   - **◀ · JUMP · ▶** hold/tap controls  
   - Canvas tap = jump only  

5. **Marshmallow Catch** — [MarshmallowCatchGame.tsx](components/kids-games/MarshmallowCatchGame.tsx)  
   - Pointer capture + drag on canvas  
   - **◀ ▶** hold buttons  
   - Play / over UI in document flow  

## Ship steps (after approve)

1. Commit all mobile files above  
2. Push `main`  
3. Smoke on a real phone: open each game, confirm Play visible, controls work, page doesn’t scroll while dragging  

## Optional later (out of scope unless requested)

- Fullscreen / landscape lock  
- Vibration on jump  
- Hide bottom nav while a game is active  

## Success criteria

- On a phone: Trail Run pick → Play → JUMP works  
- Tree Climb hold left/right + JUMP climbs  
- Marshmallow drag or hold buttons catch mallows  
- No critical UI hidden under the tab bar  
