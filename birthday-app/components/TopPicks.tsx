"use client";

import { TOP_PICKS } from "@/data/content";
import { useStore } from "@/lib/store";

export function TopPicks() {
  const { ready, byId, entries, profiles } = useStore();
  if (!ready) return <div className="h-40 animate-pulse rounded-md bg-vhs-panel" />;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {TOP_PICKS.map((pick, i) => {
        const show = byId(pick.showId);
        if (!show) return null;
        const logged = entries.filter((e) => e.showId === show.id);
        const avg =
          logged.filter((e) => e.rating).length > 0
            ? logged.reduce((sum, e) => sum + e.rating, 0) /
              logged.filter((e) => e.rating).length
            : null;

        return (
          <article
            key={pick.showId}
            className="tape rounded-md p-5"
            style={{ ["--tape-color" as string]: show.color }}
          >
            <div className="text-[0.6rem] uppercase tracking-[0.35em]" style={{ color: show.color }}>
              no. {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="chroma-soft mt-2 text-2xl font-bold leading-tight">{show.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-vhs-dim">{pick.blurb}</p>
            <p className="mt-4 text-[0.65rem] uppercase tracking-[0.2em] text-vhs-line">
              {avg ? `${avg.toFixed(1)} avg from ${profiles.length} of us` : "unrated so far"}
            </p>
          </article>
        );
      })}
    </div>
  );
}
