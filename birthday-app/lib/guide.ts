/**
 * The TV Guide channel.
 *
 * Builds one calendar day of listings — midnight to midnight — out of whatever
 * is in the library. The schedule is seeded off the date, so it's stable for
 * the whole of that day and turns over into a fresh lineup at midnight.
 *
 * Episodes aren't picked at random: anything we've logged fewer times gets
 * priority, so the guide keeps steering us at the parts of a show we've spent
 * the least time with.
 */

import { SITE } from "@/data/content";
import type { LibraryShow, LogEntry } from "@/lib/store";

export type Program = {
  /** Half-hour slot index the program starts on, 0 = midnight. */
  start: number;
  /** How many half-hour slots it runs for. */
  span: number;
  show: LibraryShow;
  /** "S04E12", or null for movies and anything without episode counts. */
  episode: string | null;
  /** The little italic line the guide prints under a title. */
  blurb: string;
};

export type Channel = {
  number: string;
  name: string;
  tint: string;
  /** Printed in the preview pane when this channel is highlighted. */
  tagline: string;
  programs: Program[];
};

export const SLOTS_PER_DAY = 48;

/** Deterministic PRNG so a given day always builds the same schedule. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromDate(date: Date) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function slotLabel(slot: number) {
  const total = ((slot % SLOTS_PER_DAY) + SLOTS_PER_DAY) % SLOTS_PER_DAY;
  const hour24 = Math.floor(total / 2);
  const minute = total % 2 === 0 ? "00" : "30";
  const suffix = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute} ${suffix}`;
}

export function currentSlot(now = new Date()) {
  return now.getHours() * 2 + (now.getMinutes() >= 30 ? 1 : 0);
}

const BLURBS_SHOW = [
  "Seen it. Watching it again. Don't make it weird.",
  "You'll say you don't remember this one. You do.",
  "Comfort television. No notes, no growth.",
  "The one you insist is the best one. It isn't.",
  "Will be paused nine times so someone can make a point.",
  "Contains an argument we've already had twice.",
  "Objectively fine. We'll talk over it anyway.",
  "Filmed in the exact aspect ratio of our attention spans.",
];

const BLURBS_NEW = [
  "Never seen it. Statistically, still won't.",
  "Been on the list so long it's basically furniture.",
  "A premiere, if you squint.",
  "First time. Nobody spoil it, there's nothing to spoil.",
  "We keep saying we'll get to this. Here's your chance.",
];

const BLURBS_MOVIE = [
  "Feature presentation. Sit still for once.",
  "Two hours. One bowl of something. No phones.",
  "The long one. Cancel whatever you were pretending to do.",
];

export function episodeKey(showId: string, season: number, episode: number) {
  return `${showId}:${season}:${episode}`;
}

export function formatEpisodeCode(season: number, episode: number) {
  return `S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`;
}

/** How many times each show, and each individual episode, has been logged. */
export type WatchCounts = {
  byShow: Map<string, number>;
  byEpisode: Map<string, number>;
};

export function countWatches(entries: LogEntry[]): WatchCounts {
  const byShow = new Map<string, number>();
  const byEpisode = new Map<string, number>();
  for (const e of entries) {
    byShow.set(e.showId, (byShow.get(e.showId) ?? 0) + 1);
    if (e.season && e.episode) {
      const key = episodeKey(e.showId, e.season, e.episode);
      byEpisode.set(key, (byEpisode.get(key) ?? 0) + 1);
    }
  }
  return { byShow, byEpisode };
}

/**
 * The least-watched episode of a show, with ties broken at random. Everything
 * unlogged is tied at zero, so a show we've barely touched still feels like a
 * shuffle — it just never suggests the same episode twice while fresh ones
 * remain.
 */
export function leastSeenEpisode(
  show: LibraryShow,
  rand: () => number,
  counts: WatchCounts,
): { season: number; episode: number } | null {
  if (show.kind === "movie") return null;
  const seasons = show.seasons;
  if (!seasons?.length) return null;

  let best: { season: number; episode: number }[] = [];
  let bestCount = Infinity;

  seasons.forEach((episodeCount, index) => {
    const season = index + 1;
    for (let episode = 1; episode <= episodeCount; episode++) {
      const seen = counts.byEpisode.get(episodeKey(show.id, season, episode)) ?? 0;
      if (seen < bestCount) {
        bestCount = seen;
        best = [{ season, episode }];
      } else if (seen === bestCount) {
        best.push({ season, episode });
      }
    }
  });

  if (best.length === 0) return null;
  return best[Math.floor(rand() * best.length)];
}

function episodeLabel(show: LibraryShow, rand: () => number, counts: WatchCounts) {
  const ep = leastSeenEpisode(show, rand, counts);
  return ep ? formatEpisodeCode(ep.season, ep.episode) : null;
}

function pick<T>(items: T[], rand: () => number): T {
  return items[Math.floor(rand() * items.length)];
}

/** Shows we've logged less often come up more often. */
function pickShow(pool: LibraryShow[], rand: () => number, counts: WatchCounts): LibraryShow {
  const weights = pool.map((s) => 1 / (1 + (counts.byShow.get(s.id) ?? 0)));
  const total = weights.reduce((a, b) => a + b, 0);
  let target = rand() * total;
  for (let i = 0; i < pool.length; i++) {
    target -= weights[i];
    if (target <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

/** Fill a channel's 24 hours with back-to-back programming. */
function fillDay(
  pool: LibraryShow[],
  rand: () => number,
  counts: WatchCounts,
  opts: { marathon?: boolean } = {},
) {
  const programs: Program[] = [];
  if (pool.length === 0) return programs;

  let slot = 0;
  const marathonShow: LibraryShow | null = opts.marathon ? pickShow(pool, rand, counts) : null;

  while (slot < SLOTS_PER_DAY) {
    const show = marathonShow ?? pickShow(pool, rand, counts);
    const isMovie = show.kind === "movie";
    // Movies run long, marathons run in one-hour chunks, everything else is
    // a 30 or 60 minute block.
    const span = isMovie ? 4 : opts.marathon ? 2 : rand() > 0.65 ? 2 : 1;
    const blurbs = isMovie
      ? BLURBS_MOVIE
      : show.status === "watchlist"
        ? BLURBS_NEW
        : BLURBS_SHOW;

    programs.push({
      start: slot,
      span: Math.min(span, SLOTS_PER_DAY - slot),
      show,
      episode: episodeLabel(show, rand, counts),
      blurb: pick(blurbs, rand),
    });
    slot += span;
  }

  return programs;
}

/**
 * Build the day's channel lineup. Channels that have nothing to show (no
 * movies in the library yet, say) are dropped rather than left empty.
 */
export function buildGuide(
  shows: LibraryShow[],
  entries: LogEntry[],
  herProfileId: string,
  date = new Date(),
): Channel[] {
  if (shows.length === 0) return [];

  const rand = rng(seedFromDate(date));
  const counts = countWatches(entries);
  const watched = shows.filter((s) => s.status === "watched");
  const watchlist = shows.filter((s) => s.status === "watchlist");
  const movies = shows.filter((s) => s.kind === "movie");

  const loggedIds = new Set(entries.map((e) => e.showId));
  const ours = shows.filter((s) => loggedIds.has(s.id));

  const herFavourites = shows.filter((s) =>
    entries.some((e) => e.profileId === herProfileId && e.showId === s.id && e.rating >= 4),
  );

  const defs: { number: string; name: string; tint: string; tagline: string; pool: LibraryShow[]; marathon?: boolean }[] = [
    {
      number: "02",
      name: "THE VAULT",
      tint: "#ffcc4d",
      tagline: "Everything we've already seen, running forever, like we asked for it.",
      pool: watched.length ? watched : shows,
    },
    {
      number: "04",
      name: "NEW TAPES",
      tint: "#4ce0e8",
      tagline: "The watchlist, pretending we ever intended to start it.",
      pool: watchlist.length ? watchlist : shows,
    },
    {
      number: "07",
      name: "MARATHON",
      tint: "#ff4ecd",
      tagline: "One show. All day. The negotiation is over.",
      pool: shows,
      marathon: true,
    },
    {
      number: "09",
      name: "THE MOVIES",
      tint: "#c58cff",
      tagline: "Feature length. Someone is falling asleep by minute forty.",
      pool: movies,
    },
    {
      number: "11",
      name: "RANDOM ACCESS",
      tint: "#68e08a",
      tagline: "No taste, no theme, no accountability.",
      pool: shows,
    },
    {
      number: "13",
      name: `${SITE.herName.toUpperCase()}'S PICKS`,
      tint: "#ff8fb1",
      tagline: "Four stars and up, per her. She's usually right and we don't discuss it.",
      pool: herFavourites,
    },
    {
      number: "22",
      name: "THE LOG",
      tint: "#7ec8ff",
      tagline: "The ones we cared enough to have opinions about in writing.",
      pool: ours,
    },
    {
      number: "31",
      name: "LATE NIGHT",
      tint: "#ffb45e",
      tagline: "The 2am channel. Nobody remembers agreeing to this.",
      pool: shows,
    },
  ];

  return defs
    .filter((d) => d.pool.length > 0)
    .map((d) => ({
      number: d.number,
      name: d.name,
      tint: d.tint,
      tagline: d.tagline,
      programs: fillDay(d.pool, rand, counts, { marathon: d.marathon }),
    }));
}

export function programAt(channel: Channel, slot: number) {
  return channel.programs.find((p) => slot >= p.start && slot < p.start + p.span);
}
