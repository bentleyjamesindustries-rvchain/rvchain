# Rename: Little Explorer + Big Explorer

## Goal
User-facing labels only (no route/id renames required).

| Current | New |
|---------|-----|
| Kids Zone | **Little Explorer** |
| Field / Field Explorer / Adult Field Explorer | **Big Explorer** |

Internal tab ids stay `kids` and `field` (avoids breaking state).

## Files to update

1. [`app/page.tsx`](C:\Users\13152\rvchain\app\page.tsx)  
   - Nav: `Kids Zone` → `Little Explorer`  
   - Nav: `Field` → `Big Explorer`  
   - Comments only if useful  

2. [`components/KidsAdventurePanel.tsx`](C:\Users\13152\rvchain\components\KidsAdventurePanel.tsx)  
   - Hub title, privacy copy, howto: “Kids Zone” → “Little Explorer”  
   - Cross-links: “Field Explorer” → “Big Explorer”  

3. [`components/AdultExplorerPanel.tsx`](C:\Users\13152\rvchain\components\AdultExplorerPanel.tsx)  
   - Gate, hub, howto: “Field Explorer” / “Adult Field Explorer” → “Big Explorer”  
   - Mentions of “Kids Zone” → “Little Explorer”  

4. [`components/KidsScavengerHunt.tsx`](C:\Users\13152\rvchain\components\KidsScavengerHunt.tsx)  
   - Header: “Field Explorer (18+)” → “Big Explorer (18+)”  
   - “Kids Zone” → “Little Explorer”  

5. Optional polish (same PR if found)  
   - [`ProfileEditor.tsx`](C:\Users\13152\rvchain\components\ProfileEditor.tsx): “Little Explorers” plant line → point to Big Explorer for packs  
   - Keep rarity label “Field Explorer” in [`kidsCards.ts`](C:\Users\13152\rvchain\lib\kidsCards.ts) (power name for cards, not the section)  

## Out of scope
- Renaming component files  
- Changing tab ids or storage keys  
- Product logic  

## Ship
- Apply string updates  
- Quick build  
- Commit + push  

## Done when
- Desktop + mobile nav show **Little Explorer** and **Big Explorer**  
- In-section headings/privacy copy match  
