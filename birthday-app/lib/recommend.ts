import type { LibraryShow, Plan } from "@/lib/store";

export type Pick = {
  show: LibraryShow;
  season?: number;
  episode?: number;
  reason: string;
};

export type Mood = "any" | "comfort" | "new";

function sample<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

/** A real season/episode pair when we know the episode counts. */
export function randomEpisode(show: LibraryShow) {
  const seasons = show.seasons;
  if (!seasons || seasons.length === 0) return {};
  const season = Math.floor(Math.random() * seasons.length) + 1;
  const count = seasons[season - 1];
  if (!count) return {};
  return { season, episode: Math.floor(Math.random() * count) + 1 };
}

/** Pure shuffle: throw a dart at the library. */
export function shuffle(shows: LibraryShow[], mood: Mood, avoidId?: string): Pick | null {
  const pool = shows
    .filter((s) => (mood === "any" ? true : mood === "comfort" ? s.status === "watched" : s.status === "watchlist"))
    .filter((s) => s.id !== avoidId);

  const show = sample(pool.length ? pool : shows.filter((s) => s.id !== avoidId));
  if (!show) return null;

  const ep = show.status === "watched" ? randomEpisode(show) : {};
  const reason =
    show.status === "watched"
      ? ep.season
        ? "A rerun we've earned. The dice picked the episode."
        : "A rerun we've earned."
      : "Still unopened. Tonight could be the night.";

  return { show, ...ep, reason };
}

/**
 * What should we actually watch next? Unlike shuffle this is opinionated:
 * something we've never scheduled beats something we have, a new show beats a
 * rewatch, and whatever we watched most recently goes to the back of the queue.
 */
export function recommend(shows: LibraryShow[], plans: Plan[]): Pick | null {
  if (shows.length === 0) return null;

  const scheduledCount = new Map<string, number>();
  const lastScheduled = new Map<string, string>();
  for (const p of plans) {
    scheduledCount.set(p.showId, (scheduledCount.get(p.showId) ?? 0) + 1);
    const prev = lastScheduled.get(p.showId);
    if (!prev || p.date > prev) lastScheduled.set(p.showId, p.date);
  }

  const mostRecent = [...plans].sort((a, b) => b.date.localeCompare(a.date))[0];

  const scored = shows.map((show) => {
    let score = 0;
    const why: string[] = [];

    if (show.status === "watchlist") {
      score += 40;
      why.push("it's still on the list");
    } else {
      score += 10;
      why.push("we already love it");
    }

    if (!scheduledCount.has(show.id)) {
      score += 25;
      why.push("we've never put it on the calendar");
    } else {
      score -= Math.min(scheduledCount.get(show.id)! * 6, 24);
    }

    if (mostRecent?.showId === show.id) {
      score -= 30;
      why.push("but we just watched it, so maybe not");
    }

    // A nudge of randomness so it doesn't give the same answer every day.
    score += Math.random() * 12;

    return { show, score, why };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  const ep = best.show.status === "watched" ? randomEpisode(best.show) : {};

  return {
    show: best.show,
    ...ep,
    reason: best.why.slice(0, 2).join(", and "),
  };
}

export function formatEpisode(pick: Pick) {
  if (!pick.season || !pick.episode) return null;
  return `S${String(pick.season).padStart(2, "0")}E${String(pick.episode).padStart(2, "0")}`;
}
