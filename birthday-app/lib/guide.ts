/**
 * The TV Guide channel.
 *
 * Builds a full day of listings out of whatever is in the library. The
 * schedule is seeded off the date, so it's stable for a whole day — reload the
 * page and you get the same listings, come back tomorrow and it's a new day of
 * television.
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
  "A rerun. We'll quote it anyway.",
  "Neither of us will admit we've seen this one twice.",
  "Comfort television. No notes.",
  "The one you keep insisting is the best one.",
  "Paused nine times for commentary.",
  "Contains at least one argument we'll have again.",
  "Recommended by the couch.",
  "In the original aspect ratio of our attention spans.",
];

const BLURBS_NEW = [
  "Never seen. Tonight could be the night.",
  "Still shrink-wrapped.",
  "Premiere — for us, anyway.",
  "First time. No spoilers.",
  "On the list since who knows when.",
];

const BLURBS_MOVIE = [
  "Feature presentation.",
  "Two hours, one bowl of something.",
  "The long one. Clear the evening.",
];

function episodeLabel(show: LibraryShow, rand: () => number) {
  if (show.kind === "movie") return null;
  const seasons = show.seasons;
  if (!seasons?.length) return null;
  const season = Math.floor(rand() * seasons.length) + 1;
  const count = seasons[season - 1] || 1;
  const episode = Math.floor(rand() * count) + 1;
  return `S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`;
}

function pick<T>(items: T[], rand: () => number): T {
  return items[Math.floor(rand() * items.length)];
}

/** Fill a channel's 24 hours with back-to-back programming. */
function fillDay(pool: LibraryShow[], rand: () => number, opts: { marathon?: boolean } = {}) {
  const programs: Program[] = [];
  if (pool.length === 0) return programs;

  let slot = 0;
  let marathonShow: LibraryShow | null = opts.marathon ? pick(pool, rand) : null;

  while (slot < SLOTS_PER_DAY) {
    const show = marathonShow ?? pick(pool, rand);
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
      episode: episodeLabel(show, rand),
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
      tagline: "Everything we've already watched, on a loop, forever.",
      pool: watched.length ? watched : shows,
    },
    {
      number: "04",
      name: "NEW TAPES",
      tint: "#4ce0e8",
      tagline: "The watchlist, playing as if we'd already started it.",
      pool: watchlist.length ? watchlist : shows,
    },
    {
      number: "07",
      name: "MARATHON",
      tint: "#ff4ecd",
      tagline: "One show. All day. No negotiating.",
      pool: shows,
      marathon: true,
    },
    {
      number: "09",
      name: "THE MOVIES",
      tint: "#c58cff",
      tagline: "Feature length. Bring snacks.",
      pool: movies,
    },
    {
      number: "11",
      name: "RANDOM ACCESS",
      tint: "#68e08a",
      tagline: "Whatever the tape lands on.",
      pool: shows,
    },
    {
      number: "13",
      name: `${SITE.herName.toUpperCase()}'S PICKS`,
      tint: "#ff8fb1",
      tagline: "Anything she gave four stars or better.",
      pool: herFavourites,
    },
    {
      number: "22",
      name: "THE LOG",
      tint: "#7ec8ff",
      tagline: "Only the ones we've actually written about.",
      pool: ours,
    },
    {
      number: "31",
      name: "LATE NIGHT",
      tint: "#ffb45e",
      tagline: "The 2am channel. You know the one.",
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
      programs: fillDay(d.pool, rand, { marathon: d.marathon }),
    }));
}

export function programAt(channel: Channel, slot: number) {
  return channel.programs.find((p) => slot >= p.start && slot < p.start + p.span);
}
