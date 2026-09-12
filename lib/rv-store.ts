"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category } from "./types";

export type Locale = "en" | "es";

export type Trip = {
  id: string;
  start: string;
  end: string;
  stops: string;
  vehicle: Category;
  pack: string[];
  checklist: string[];
  notes: string;
};

export type TrailLog = {
  id: string;
  date: string;
  vehicle: Category;
  title: string;
  miles: string;
  notes: string;
};

export type ForumPost = {
  id: string;
  author: string;
  title: string;
  body: string;
  createdAt: number;
};

const SEED_FORUM: ForumPost[] = [
  {
    id: "seed-1",
    author: "Clay rider",
    title: "Anyone airing down on Tug Hill this weekend?",
    body: "Planning a Saturday loop if the gates are open. Extra belt in the truck if somebody needs one.",
    createdAt: Date.UTC(2026, 7, 19),
  },
  {
    id: "seed-2",
    author: "MX Dana",
    title: "CRF450 swingarm bearings — worth a refresh?",
    body: "Pivot feels notchy after a sandy moto. Looking at used arms on the board vs just packing new bearings. Anyone run the KX250F arm as a spare?",
    createdAt: Date.UTC(2026, 7, 17),
  },
  {
    id: "seed-4",
    author: "Oval Mike",
    title: "Dirt beadlock vs asphalt wheel — don’t mix them",
    body: "Someone listed a 15-inch beadlock in asphalt. If you’re shopping racing parts, filter Racecar then Dirt, Asphalt, or Offroad. The hardware is not the same.",
    createdAt: Date.UTC(2026, 7, 12),
  },
];

type RvState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  points: number;
  addPoints: (n: number) => void;
  trips: Trip[];
  addTrip: (trip: Trip) => void;
  logs: TrailLog[];
  addLog: (entry: TrailLog) => void;
  posts: ForumPost[];
  addPost: (post: ForumPost) => void;
};

export const useRvStore = create<RvState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale: locale === "es" ? "es" : "en" }),
      points: 0,
      addPoints: (n) => set((s) => ({ points: s.points + n })),
      trips: [],
      addTrip: (trip) => set((s) => ({ trips: [trip, ...s.trips].slice(0, 20) })),
      logs: [],
      addLog: (entry) => set((s) => ({ logs: [entry, ...s.logs].slice(0, 40) })),
      posts: SEED_FORUM,
      addPost: (post) => set((s) => ({ posts: [post, ...s.posts].slice(0, 40) })),
    }),
    {
      name: "rv-chain",
      merge: (persisted, current) => {
        const p = persisted && typeof persisted === "object" ? (persisted as Partial<RvState>) : {};
        return {
          ...current,
          ...p,
          locale: p.locale === "es" ? "es" : "en",
          trips: Array.isArray(p.trips) ? p.trips : current.trips,
          logs: Array.isArray(p.logs) ? p.logs : current.logs,
          posts: Array.isArray(p.posts) ? p.posts : current.posts,
        };
      },
    },
  ),
);
