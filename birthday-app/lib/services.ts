/**
 * Where a thing can actually be watched.
 *
 * These are lettermark badges rather than the real logos — brand marks aren't
 * ours to ship. Swap in real icons any time by pointing `image` at a file in
 * public/ and the badge will use it instead.
 */

export type Service = {
  id: string;
  name: string;
  /** What goes inside the badge. Kept to four characters or fewer. */
  mark: string;
  color: string;
  /** Optional path to a real logo, e.g. "/services/netflix.svg". */
  image?: string;
};

/** Stremio is the fallback: if we haven't said where something lives, it's there. */
export const DEFAULT_SERVICE = "stremio";

export const SERVICES: Service[] = [
  { id: "stremio", name: "Stremio", mark: "STR", color: "#7b5bf5" },
  { id: "netflix", name: "Netflix", mark: "N", color: "#e50914" },
  { id: "max", name: "Max", mark: "MAX", color: "#4b6fff" },
  { id: "hulu", name: "Hulu", mark: "hulu", color: "#1ce783" },
  { id: "disney", name: "Disney+", mark: "D+", color: "#5b8cff" },
  { id: "prime", name: "Prime Video", mark: "prime", color: "#00a8e1" },
  { id: "appletv", name: "Apple TV+", mark: "tv+", color: "#d8d8d8" },
  { id: "paramount", name: "Paramount+", mark: "P+", color: "#4a8dff" },
  { id: "peacock", name: "Peacock", mark: "PCK", color: "#ffcc4d" },
  { id: "youtube", name: "YouTube", mark: "YT", color: "#ff4444" },
  { id: "other", name: "Somewhere else", mark: "?", color: "#9b91c4" },
];

export function serviceById(id: string | undefined): Service {
  return SERVICES.find((s) => s.id === id) ?? SERVICES[0];
}
