import type { LibraryShow } from "@/lib/store";

export type PartGroup = { season: number; episodes: number[] };

/** The two-parter (or three-parter) an episode belongs to, if any. */
export function groupFor(
  show: LibraryShow,
  season?: number,
  episode?: number,
): PartGroup | null {
  if (!season || !episode || !show.parts?.length) return null;
  return (
    show.parts.find((g) => g.season === season && g.episodes.includes(episode)) ?? null
  );
}

/** True for anything that isn't the opening part of its group. */
export function isLaterPart(show: LibraryShow, season?: number, episode?: number): boolean {
  const group = groupFor(show, season, episode);
  return Boolean(group && episode && group.episodes[0] !== episode);
}

/** Where to actually start: the first part of the group, or the episode itself. */
export function startOfGroup(
  show: LibraryShow,
  season?: number,
  episode?: number,
): { season?: number; episode?: number } {
  const group = groupFor(show, season, episode);
  if (!group) return { season, episode };
  return { season: group.season, episode: group.episodes[0] };
}
