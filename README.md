# rvchain

**The connected community of RV travelers.**

Find RV parks & campgrounds nationwide. Use GPS + Google Maps for navigation. Chat with fellow RVers about destinations and vacation spots.

Built as a modern, production-ready Next.js app (migrated from the working single-file prototype).

## Quick Start

```bash
cd rvchain
npm run dev
```

Open http://localhost:3000

All core features work immediately in your browser:
- Nationwide search + advanced filters
- "Use My Location" (GPS) + distance sorting
- Interactive map (Leaflet)
- One-tap "Get Directions" → full Google Maps navigation with GPS/voice
- Community chat (demo with persistence)
- Save favorites / My Stops
- Fully responsive for phone, tablet, laptop

## Running the App

```bash
npm run dev          # Development (with hot reload)
npm run build        # Production build (verified clean)
npm run start        # Run production build locally
```

## Project Structure (key files)

- `app/page.tsx` — The full rvchain experience (tabs: Discover / Map / Community)
- `lib/parks.ts` — 25+ realistic parks with data + distance helper
- `components/MapView.tsx` — React Leaflet map (filters update live)
- `app/layout.tsx` + `globals.css` — Dark RV-themed UI + Leaflet styles + Sonner toasts

## Original Prototype

A fully self-contained version is still available at:

`C:\Users\13152\rvchain.html`

Double-click it to open instantly (no Node needed). Great for quick demos or offline use.

## Next Steps & Roadmap

- Deploy for free: `npx vercel` (or push to GitHub + Vercel)
- Real backend: Supabase (user accounts + realtime multi-RVer chat)
- User-generated content: Submit new parks
- Moderator-verified park listings and seller certification badges
- PWA + native feel on mobile
- Real data sources (Recreation.gov, etc.)

This is the foundation for a real product. Everything you loved in the prototype is here, now in clean React + TypeScript.

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS
- Leaflet + react-leaflet (maps)
- Lucide icons
- Sonner (toasts)
- 100% client-side for zero backend friction (easy to upgrade)

---

Original Next.js starter below (for reference):

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
