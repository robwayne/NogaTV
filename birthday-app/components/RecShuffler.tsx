"use client";

import { useState } from "react";
import { countWatches, formatEpisodeCode, leastSeenEpisode } from "@/lib/guide";
import { useStore, type LibraryRec } from "@/lib/store";
import { SITE } from "@/data/content";

type Source = "me" | "her" | "both";

type Suggestion = {
  rec: LibraryRec;
  episode: string | null;
  line: string;
};

const LINES: Record<"show" | "film", string[]> = {
  show: [
    "Put it on. Argue about it after.",
    "One episode. That's all anyone ever commits to.",
    "Start it tonight and see what happens.",
  ],
  film: ["Feature length. Clear the evening.", "One sitting, no phones.", "Watch it properly."],
};

/** Roll a recommendation from one shelf or from both at once. */
export function RecShuffler() {
  const { ready, recs, shows, entries, profiles } = useStore();
  const [source, setSource] = useState<Source>("both");
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [rolling, setRolling] = useState(false);

  const herName = SITE.herName;
  const myName = profiles.find((p) => p.id === "me")?.name ?? SITE.fromName;

  function roll(from: Source) {
    setSource(from);
    setRolling(true);

    const pool = recs.filter((r) => {
      if (r.done) return false;
      if (from === "both") return true;
      return r.by === from;
    });
    // Everything already ticked off is skipped, unless that's all there is.
    const fallback = recs.filter((r) => (from === "both" ? true : r.by === from));
    const candidates = pool.length ? pool : fallback;

    window.setTimeout(() => {
      setRolling(false);
      if (candidates.length === 0) return setSuggestion(null);

      const rec = candidates[Math.floor(Math.random() * candidates.length)];
      const show = rec.showId ? shows.find((s) => s.id === rec.showId) : undefined;
      // If it's linked to something in the library, point at the episode
      // we've spent the least time with.
      const ep = show ? leastSeenEpisode(show, Math.random, countWatches(entries)) : null;
      const lines = LINES[rec.kind];

      setSuggestion({
        rec,
        episode: ep ? formatEpisodeCode(ep.season, ep.episode) : null,
        line: lines[Math.floor(Math.random() * lines.length)],
      });
    }, 420);
  }

  const buttons: { id: Source; label: string; tint: string }[] = [
    { id: "me", label: `from ${myName}`, tint: "var(--color-vhs-cyan)" },
    { id: "her", label: `from ${herName}`, tint: "var(--color-vhs-magenta)" },
    { id: "both", label: "either of us", tint: "var(--color-vhs-amber)" },
  ];

  return (
    <div className="tape rounded-md p-5 sm:p-7">
      <div className="min-h-[130px]">
        {rolling ? (
          <p className="chroma text-2xl uppercase tracking-[0.2em] text-vhs-dim sm:text-3xl">
            ◀◀ rewinding…
          </p>
        ) : suggestion ? (
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-vhs-dim">
              {suggestion.rec.by === "her" ? herName : myName} says
              <span className="ml-2 text-vhs-line">·</span>
              <span className="ml-2">{suggestion.rec.kind}</span>
            </p>
            <h3 className="chroma-soft mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              {suggestion.rec.title}
            </h3>
            {suggestion.episode ? (
              <p className="mt-1 text-sm tracking-[0.2em] text-vhs-amber">
                start with {suggestion.episode} — the one we&apos;ve watched least
              </p>
            ) : null}
            {suggestion.rec.note ? (
              <p className="mt-3 max-w-xl text-sm text-vhs-dim">{suggestion.rec.note}</p>
            ) : null}
            <p className="mt-2 max-w-xl text-sm italic text-vhs-line">{suggestion.line}</p>
          </div>
        ) : (
          <p className="text-sm text-vhs-dim">
            Pick a shelf. Everything already ticked off gets skipped.
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-[0.7rem] uppercase tracking-[0.2em]">
        {buttons.map((b) => (
          <button
            key={b.id}
            type="button"
            disabled={!ready}
            onClick={() => roll(b.id)}
            className="rounded-sm border px-4 py-2 transition-colors"
            style={{
              borderColor: b.tint,
              color: b.tint,
              background: source === b.id && suggestion ? `color-mix(in srgb, ${b.tint} 10%, transparent)` : undefined,
            }}
          >
            ⇄ {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}
