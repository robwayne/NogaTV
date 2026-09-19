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
  color: string;
  /** Optional path to a real logo, e.g. "/services/netflix.svg". */
  image?: string;
};

/** Stremio is the fallback: if we haven't said where something lives, it's there. */
export const DEFAULT_SERVICE = "stremio";

export const SERVICES: Service[] = [
  { id: "stremio", name: "Stremio", color: "#7b5bf5" },
  { id: "netflix", name: "Netflix", color: "#e50914" },
  { id: "disney", name: "Disney+", color: "#5b8cff" },
  { id: "appletv", name: "Apple TV+", color: "#d8d8d8" },
  { id: "youtube", name: "YouTube", color: "#ff4444" },
];

export function serviceById(id: string | undefined): Service {
  return SERVICES.find((s) => s.id === id) ?? SERVICES[0];
}

/** False for anything that isn't one of the services above any more. */
export function isKnownService(id: string | undefined): boolean {
  return SERVICES.some((s) => s.id === id);
}
