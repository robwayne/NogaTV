/**
 * Ranking everything we could watch, at the level of the individual episode.
 *
 * The rule that matters: a show's rating never overrides its own episodes'
 * ratings. A show rating is only a *prior* — a guess that stands in for the
 * episodes we haven't judged individually — and it's deliberately pulled
 * toward the middle so it can't outrank a real verdict on a real episode.
 *
 * So a 3-star show with a handful of 5-star episodes beats a 4-star show whose
 * episodes we've only rated 3. The episodes are compared against each other,
 * not their parent shows.
 */

import { groupFor, isLaterPart } from "@/lib/parts";
import type { LibraryShow, LogEntry } from "@/lib/store";

/** Where an unrated thing sits on the 1–5 scale. */
const NEUTRAL = 2.5;

/** How much of a show's rating carries over to an episode we haven't rated. */
const SHOW_PRIOR_WEIGHT = 0.8;

/** Points per star. Everything else is tuned against this. */
const STAR = 10;

/** Something we haven't started is worth reaching for. */
const UNWATCHED_BONUS = 6;

/** Each time we've logged this exact episode, it sinks. */
const REWATCH_PENALTY = 4;

/** And a show we lean on constantly sinks a little too. */
const SHOW_FATIGUE_PENALTY = 0.5;

/** Keeps it from giving the identical answer every single time. */
const JITTER = 3;

export type RatingLookup = {
  showRating: (showId: string) => number;
  episodeRating: (showId: string, season: number, episode: number) => number;
};

export type Candidate = {
  show: LibraryShow;
  season?: number;
  episode?: number;
  /** "S04E12", or null for films and shows with no episode list. */
  code: string | null;
  /** 1–5 on the episode's own terms, after the show prior is applied. */
  quality: number;
  /** True when that quality came from the episode itself, not the show. */
  ratedDirectly: boolean;
  score: number;
  reasons: string[];
  /** Every episode code in this candidate's group, when it's a two-parter. */
  partCodes?: string[];
};

export function episodeCode(season: number, episode: number) {
  return `S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`;
}

export function watchCounts(entries: LogEntry[]) {
  const byShow = new Map<string, number>();
  const byEpisode = new Map<string, number>();
  for (const e of entries) {
    byShow.set(e.showId, (byShow.get(e.showId) ?? 0) + 1);
    if (e.season && e.episode) {
      const key = `${e.showId}:${e.season}:${e.episode}`;
      byEpisode.set(key, (byEpisode.get(key) ?? 0) + 1);
    }
  }
  return { byShow, byEpisode };
}

/**
 * What we think of one episode, on the 1–5 scale. Its own rating is taken at
 * face value; without one, the show's rating is shaded toward neutral.
 */
export function qualityOf(
  show: LibraryShow,
  ratings: RatingLookup,
  season?: number,
  episode?: number,
): { quality: number; ratedDirectly: boolean } {
  if (season && episode) {
    const own = ratings.episodeRating(show.id, season, episode);
    if (own > 0) return { quality: own, ratedDirectly: true };
  }
  const showStars = ratings.showRating(show.id);
  if (showStars > 0) {
    return {
      quality: NEUTRAL + (showStars - NEUTRAL) * SHOW_PRIOR_WEIGHT,
      ratedDirectly: false,
    };
  }
  return { quality: NEUTRAL, ratedDirectly: false };
}

export type RankOptions = {
  /** Limit to one half of the library. */
  status?: "watched" | "watchlist";
  /** Films only, episodes only, or don't care. */
  kind?: "movie" | "show";
  /** Leave the randomness out — for anything that needs a stable order. */
  deterministic?: boolean;
  /** Only consider episodes someone has actually put a rating on. */
  ratedOnly?: boolean;
  /** Keep later parts of a two-parter in the running (the guide wants them). */
  allowLaterParts?: boolean;
  random?: () => number;
};

/**
 * Every episode of every show (plus films as single entries), scored and
 * sorted best-first.
 */
export function rankCandidates(
  shows: LibraryShow[],
  entries: LogEntry[],
  ratings: RatingLookup,
  options: RankOptions = {},
): Candidate[] {
  const rand = options.random ?? Math.random;
  const counts = watchCounts(entries);
  const out: Candidate[] = [];

  const pool = shows.filter((s) => {
    if (options.status && s.status !== options.status) return false;
    if (options.kind === "movie" && s.kind !== "movie") return false;
    if (options.kind === "show" && s.kind === "movie") return false;
    return true;
  });

  for (const show of pool) {
    const seasons = show.kind === "movie" ? undefined : show.seasons;

    const slots: { season?: number; episode?: number }[] = seasons?.length
      ? seasons.flatMap((count, i) =>
          Array.from({ length: count }, (_, j) => ({ season: i + 1, episode: j + 1 })),
        )
      : [{}];

    for (const slot of slots) {
      // Never recommend part two as a thing to watch: the group's opening
      // part stands in for the whole run of it.
      if (!options.allowLaterParts && isLaterPart(show, slot.season, slot.episode)) continue;

      const { quality, ratedDirectly } = qualityOf(show, ratings, slot.season, slot.episode);
      if (options.ratedOnly && !ratedDirectly) continue;

      const episodeSeen =
        slot.season && slot.episode
          ? (counts.byEpisode.get(`${show.id}:${slot.season}:${slot.episode}`) ?? 0)
          : (counts.byShow.get(show.id) ?? 0);
      const showSeen = counts.byShow.get(show.id) ?? 0;

      const reasons: string[] = [];
      if (ratedDirectly) reasons.push(`you rated this episode ${quality}/5`);
      else if (ratings.showRating(show.id) > 0)
        reasons.push(`the show's ${ratings.showRating(show.id)}/5 standing in for an unrated episode`);

      let score = quality * STAR;

      if (show.status === "watchlist") {
        score += UNWATCHED_BONUS;
        reasons.push("we've never started it");
      }

      score -= Math.min(episodeSeen * REWATCH_PENALTY, REWATCH_PENALTY * 4);
      if (episodeSeen > 0) reasons.push(`logged ${episodeSeen}×`);

      score -= Math.min(showSeen * SHOW_FATIGUE_PENALTY, 6);
      if (!options.deterministic) score += rand() * JITTER;

      const group = groupFor(show, slot.season, slot.episode);
      if (group) reasons.push(`${group.episodes.length} parts — watch them together`);

      out.push({
        show,
        season: slot.season,
        episode: slot.episode,
        code: slot.season && slot.episode ? episodeCode(slot.season, slot.episode) : null,
        partCodes: group?.episodes.map((e) => episodeCode(group.season, e)),
        quality,
        ratedDirectly,
        score,
        reasons,
      });
    }
  }

  return out.sort((a, b) => b.score - a.score);
}

/** The single best thing to watch under these constraints. */
export function bestCandidate(
  shows: LibraryShow[],
  entries: LogEntry[],
  ratings: RatingLookup,
  options: RankOptions = {},
): Candidate | null {
  return rankCandidates(shows, entries, ratings, options)[0] ?? null;
}

/** Shows ordered by the best episode each one currently has to offer. */
export function rankShows(
  shows: LibraryShow[],
  entries: LogEntry[],
  ratings: RatingLookup,
  options: RankOptions = {},
): { show: LibraryShow; best: Candidate }[] {
  const best = new Map<string, Candidate>();
  for (const c of rankCandidates(shows, entries, ratings, { ...options, deterministic: true })) {
    if (!best.has(c.show.id)) best.set(c.show.id, c);
  }
  return [...best.values()]
    .sort((a, b) => b.score - a.score)
    .map((best) => ({ show: best.show, best }));
}
