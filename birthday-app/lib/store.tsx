"use client";

/**
 * All of the state that lives in the browser: shows added on the fly, which
 * ones are watched, and what we've scheduled to watch on which night.
 *
 * Seed shows come from data/content.ts. Anything done in the UI is layered on
 * top and saved to localStorage, so the seed file stays the source of truth for
 * the writing and the browser holds the day-to-day stuff.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SITE, WATCHED, WATCHLIST, type Show } from "@/data/content";

export type Status = "watched" | "watchlist";

export type LibraryShow = Show & {
  status: Status;
  /** True when it was added in the browser rather than in data/content.ts. */
  custom: boolean;
};

export type Profile = {
  id: string;
  name: string;
  color: string;
};

/** One Letterboxd-style entry: a rating and a few words about one episode. */
export type LogEntry = {
  id: string;
  profileId: string;
  showId: string;
  season?: number;
  episode?: number;
  /** 1–5. */
  rating: number;
  text: string;
  /** ISO date the entry was written. */
  createdAt: string;
};

export type Plan = {
  /** YYYY-MM-DD */
  date: string;
  showId: string;
  season?: number;
  episode?: number;
  note?: string;
};

type Persisted = {
  customShows: (Show & { status: Status })[];
  statusOverrides: Record<string, Status>;
  removedIds: string[];
  plans: Plan[];
  profiles: Profile[];
  activeProfileId: string | null;
  entries: LogEntry[];
};

const DEFAULT_PROFILES: Profile[] = [
  { id: "her", name: SITE.herName, color: "#ff4ecd" },
  { id: "me", name: SITE.fromName, color: "#4ce0e8" },
];

const EMPTY: Persisted = {
  customShows: [],
  statusOverrides: {},
  removedIds: [],
  plans: [],
  profiles: DEFAULT_PROFILES,
  activeProfileId: null,
  entries: [],
};

const KEY = "tapes.v1";

const PALETTE = [
  "#f7d046",
  "#4ce0b3",
  "#7ec8ff",
  "#ff8fb1",
  "#c58cff",
  "#ffb45e",
  "#68e08a",
  "#ff6b6b",
];

function load(): Persisted {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<Persisted>) };
  } catch {
    return EMPTY;
  }
}

function save(state: Persisted) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private browsing, quota, etc. — the seed content still renders fine */
  }
}

export function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `show-${Date.now()}`;
}

export function initialsFor(title: string) {
  const words = title.replace(/[^a-zA-Z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map((w) => w[0]).join("").toUpperCase();
}

type Ctx = {
  ready: boolean;
  shows: LibraryShow[];
  watched: LibraryShow[];
  watchlist: LibraryShow[];
  plans: Plan[];
  profiles: Profile[];
  activeProfile: Profile | null;
  entries: LogEntry[];
  byId: (id: string) => LibraryShow | undefined;
  setActiveProfile: (id: string | null) => void;
  renameProfile: (id: string, name: string) => void;
  addEntry: (entry: Omit<LogEntry, "id" | "profileId" | "createdAt">) => void;
  removeEntry: (id: string) => void;
  entriesForShow: (showId: string) => LogEntry[];
  addShow: (input: {
    title: string;
    years?: string;
    note?: string;
    status: Status;
    seasons?: number[];
  }) => void;
  setStatus: (id: string, status: Status) => void;
  removeShow: (id: string) => void;
  setPlan: (plan: Plan) => void;
  clearPlan: (date: string) => void;
  exportJson: () => string;
  resetAll: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  const update = useCallback((fn: (prev: Persisted) => Persisted) => {
    setState((prev) => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, []);

  const shows = useMemo<LibraryShow[]>(() => {
    const seed: LibraryShow[] = [
      ...WATCHED.map((s) => ({ ...s, status: "watched" as Status, custom: false })),
      ...WATCHLIST.map((s) => ({ ...s, status: "watchlist" as Status, custom: false })),
    ];
    const custom: LibraryShow[] = state.customShows.map((s) => ({ ...s, custom: true }));
    return [...seed, ...custom]
      .filter((s) => !state.removedIds.includes(s.id))
      .map((s) => ({ ...s, status: state.statusOverrides[s.id] ?? s.status }));
  }, [state]);

  const value = useMemo<Ctx>(() => {
    const byId = (id: string) => shows.find((s) => s.id === id);

    return {
      ready,
      shows,
      watched: shows.filter((s) => s.status === "watched"),
      watchlist: shows.filter((s) => s.status === "watchlist"),
      plans: [...state.plans].sort((a, b) => a.date.localeCompare(b.date)),
      profiles: state.profiles.length ? state.profiles : DEFAULT_PROFILES,
      activeProfile:
        state.profiles.find((p) => p.id === state.activeProfileId) ?? null,
      entries: [...state.entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      byId,
      setActiveProfile: (id) => update((prev) => ({ ...prev, activeProfileId: id })),
      renameProfile: (id, name) =>
        update((prev) => ({
          ...prev,
          profiles: prev.profiles.map((p) =>
            p.id === id ? { ...p, name: name.trim() || p.name } : p,
          ),
        })),
      addEntry: (entry) =>
        update((prev) => {
          if (!prev.activeProfileId) return prev;
          const record: LogEntry = {
            ...entry,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            profileId: prev.activeProfileId,
            createdAt: new Date().toISOString(),
          };
          return { ...prev, entries: [record, ...prev.entries] };
        }),
      removeEntry: (id) =>
        update((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) })),
      entriesForShow: (showId) =>
        state.entries
          .filter((e) => e.showId === showId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      addShow: ({ title, years, note, status, seasons }) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        update((prev) => {
          const taken = new Set([
            ...shows.map((s) => s.id),
            ...prev.customShows.map((s) => s.id),
          ]);
          let id = slugify(trimmed);
          let n = 2;
          while (taken.has(id)) id = `${slugify(trimmed)}-${n++}`;
          const show: Show & { status: Status } = {
            id,
            title: trimmed,
            years: years?.trim() || "",
            initials: initialsFor(trimmed),
            color: PALETTE[taken.size % PALETTE.length],
            note: note?.trim() || "",
            status,
            ...(seasons && seasons.length ? { seasons } : {}),
            ...(status === "watched" && seasons?.length
              ? { progress: { seasonsWatched: seasons.length, seasonsTotal: seasons.length } }
              : {}),
          };
          return { ...prev, customShows: [...prev.customShows, show] };
        });
      },
      setStatus: (id, status) =>
        update((prev) => ({
          ...prev,
          statusOverrides: { ...prev.statusOverrides, [id]: status },
        })),
      removeShow: (id) =>
        update((prev) => ({
          ...prev,
          customShows: prev.customShows.filter((s) => s.id !== id),
          removedIds: prev.removedIds.includes(id)
            ? prev.removedIds
            : [...prev.removedIds, id],
          plans: prev.plans.filter((p) => p.showId !== id),
          entries: prev.entries.filter((e) => e.showId !== id),
        })),
      setPlan: (plan) =>
        update((prev) => ({
          ...prev,
          plans: [...prev.plans.filter((p) => p.date !== plan.date), plan],
        })),
      clearPlan: (date) =>
        update((prev) => ({ ...prev, plans: prev.plans.filter((p) => p.date !== date) })),
      exportJson: () => JSON.stringify(state, null, 2),
      resetAll: () => update(() => EMPTY),
    };
  }, [ready, shows, state, update]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
