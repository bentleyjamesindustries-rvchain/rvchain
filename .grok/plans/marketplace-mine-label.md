# Marketplace: rename "Mine" tab

## Decision
Replace the marketplace hub tab label **Mine** with **Manage listings**.

Internal view id can stay `mine` (no storage/API impact) — only user-facing copy changes.

## Files
- [`components/MarketplaceHub.tsx`](C:\Users\13152\rvchain\components\MarketplaceHub.tsx)
  - Tab map: `['mine', 'Mine', Info]` → `['mine', 'Manage listings', …]`
  - Prefer a clearer icon if needed (e.g. `List` / `LayoutList` / `FolderOpen` instead of `Info`)
  - Scan for any other "Mine" strings in headings/empty states in this view

- [`components/RvMarketplacePanel.tsx`](C:\Users\13152\rvchain\components\RvMarketplacePanel.tsx)
  - Already uses `My listings (${count})` — leave as-is or align to **Manage listings** for consistency if that panel is still shown

## Scope
- Label + optional icon only
- Do not rename data keys, routes, or localStorage

## Done when
- Market hub shows **Manage listings** instead of **Mine**
- Same view still lists My RVs / My gear / My parts
- Build passes; commit + push if shipping with other work
