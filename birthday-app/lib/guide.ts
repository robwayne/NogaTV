/**
 * The TV Guide channel.
 *
 * One channel per show, each one running that show around the clock. The
 * slots hold episode recommendations rather than a real running order: the
 * ranking engine decides what's worth putting on, so the episodes we haven't
 * watched — or rate highest — come first, and nothing repeats until the whole
 * run has been through the day.
 *
 * The schedule is seeded off the date, so it holds for the whole of that day
 * and turns over into a fresh lineup at midnight.
 */

import { SITE } from "@/data/content";
import { groupFor } from "@/lib/parts";
import { qualityOf, rankCandidates, rankShows, type RatingLookup } from "@/lib/rank";
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
  /** The show this channel runs around the clock. */
  show: LibraryShow;
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
  ratings?: RatingLookup,
): { season: number; episode: number } | null {
  if (show.kind === "movie") return null;
  const seasons = show.seasons;
  if (!seasons?.length) return null;

  let best: { season: number; episode: number }[] = [];
  let bestRank = -Infinity;

  seasons.forEach((episodeCount, index) => {
    const season = index + 1;
    for (let episode = 1; episode <= episodeCount; episode++) {
      const seen = counts.byEpisode.get(episodeKey(show.id, season, episode)) ?? 0;
      // Fewest watches first, then whatever we rate highest among those.
      const quality = ratings ? qualityOf(show, ratings, season, episode).quality : 0;
      const rank = -seen * 100 + quality;
      if (rank > bestRank) {
        bestRank = rank;
        best = [{ season, episode }];
      } else if (rank === bestRank) {
        best.push({ season, episode });
      }
    }
  });

  if (best.length === 0) return null;
  return best[Math.floor(rand() * best.length)];
}

function pick<T>(items: T[], rand: () => number): T {
  return items[Math.floor(rand() * items.length)];
}

/**
 * Fill one show's 24 hours. Episodes come off the ranking engine best-first,
 * so a channel reads as a running list of what to watch next rather than a
 * broadcast order, and nothing repeats until the show runs out.
 */
function fillDay(show: LibraryShow, rand: () => number, ratings: RatingLookup) {
  const programs: Program[] = [];
  const isMovie = show.kind === "movie";

  // Ranked best-first, then drawn from with a bias toward the front: every
  // half hour is a different suggestion, but the good ones come up more.
  const ranked = rankCandidates([show], [], ratings, {
    deterministic: true,
    allowLaterParts: true,
  })
    .map((c) => c.code)
    .filter((code): code is string => Boolean(code));

  let remaining = [...ranked];

  /**
   * Draws the next thing to schedule. A two-parter comes back whole, so the
   * caller can lay its parts down in consecutive slots rather than letting
   * part two turn up three hours before part one.
   */
  const draw = (slotsLeft: number): string[] => {
    if (ranked.length === 0) return [];
    if (remaining.length === 0) remaining = [...ranked];
    // rand² lands near zero more often than not, which is the top of the list.
    const index = Math.floor(rand() ** 2 * remaining.length);
    const [code] = remaining.splice(index, 1);

    const parsed = code.match(/^S(\d+)E(\d+)$/);
    const group = parsed ? groupFor(show, Number(parsed[1]), Number(parsed[2])) : null;
    if (!group) return [code];

    const codes = group.episodes.map((e) => formatEpisodeCode(group.season, e));

    // Don't start a two-parter that midnight would cut in half — put it back
    // and take something that fits instead.
    if (codes.length > slotsLeft) {
      remaining.push(code);
      const single = remaining.findIndex((c) => {
        const m = c.match(/^S(\d+)E(\d+)$/);
        return !m || !groupFor(show, Number(m[1]), Number(m[2]));
      });
      if (single === -1) return [];
      return remaining.splice(single, 1);
    }

    // Whichever part was drawn, the whole group goes out together and none of
    // its parts can be drawn again this cycle.
    remaining = remaining.filter((c) => !codes.includes(c));
    return codes;
  };

  const blurbs = isMovie ? BLURBS_MOVIE : show.status === "watchlist" ? BLURBS_NEW : BLURBS_SHOW;

  let slot = 0;
  let lastBlurb = "";

  while (slot < SLOTS_PER_DAY) {
    // Every half-hour slot gets its own recommendation; a film needs longer.
    const span = isMovie ? 4 : 1;
    const codes = isMovie ? [null] : draw(SLOTS_PER_DAY - slot);

    codes.forEach((code, i) => {
      if (slot >= SLOTS_PER_DAY) return;

      // Two identical lines in a row reads like a bug, so nudge past a repeat.
      let blurb = pick(blurbs, rand);
      if (blurb === lastBlurb) blurb = pick(blurbs, rand);
      lastBlurb = blurb;

      programs.push({
        start: slot,
        span: Math.min(span, SLOTS_PER_DAY - slot),
        show,
        episode: code ?? null,
        // A part that isn't the first says so, so the grid reads in order.
        blurb: codes.length > 1 ? `Part ${i + 1} of ${codes.length}. ${blurb}` : blurb,
      });

      slot += span;
    });

    if (codes.length === 0) slot += span;
  }

  return programs;
}

/** Which half of the library the guide is allowed to broadcast. */
export type GuideFilter = "all" | "watched" | "watchlist";

/** Every show in the library gets a channel of its own. */
export function buildGuide(
  allShows: LibraryShow[],
  entries: LogEntry[],
  date = new Date(),
  filter: GuideFilter = "all",
  ratings?: RatingLookup,
): Channel[] {
  const shows = filter === "all" ? allShows : allShows.filter((s) => s.status === filter);
  if (shows.length === 0) return [];

  const rand = rng(seedFromDate(date));
  const lookup: RatingLookup = ratings ?? { showRating: () => 0, episodeRating: () => 0 };

  // The channels worth watching sit at the top of the scroll.
  const ordered = ratings ? rankShows(shows, entries, lookup).map((r) => r.show) : shows;

  return ordered.map((show) => ({
    show,
    name: show.title,
    tint: show.color,
    tagline:
      show.note?.trim() ||
      (show.status === "watchlist"
        ? "Twenty-four hours of something we have never once started."
        : "All day, every day. No scheduling conflicts here."),
    programs: fillDay(show, rand, lookup),
  }));
}

export function programAt(channel: Channel, slot: number) {
  return channel.programs.find((p) => slot >= p.start && slot < p.start + p.span);
}
