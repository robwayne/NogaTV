"use client";

import { useState } from "react";
import { formatEpisode, recommend, shuffle, type Mood, type Pick } from "@/lib/recommend";
import { useStore } from "@/lib/store";

const MOODS: { id: Mood; label: string }[] = [
  { id: "any", label: "anything" },
  { id: "comfort", label: "comfort rewatch" },
  { id: "new", label: "something new" },
];

export function TonightPicker() {
  const { ready, shows, plans, setPlan } = useStore();
  const [mood, setMood] = useState<Mood>("any");
  const [pick, setPick] = useState<Pick | null>(null);
  const [rolling, setRolling] = useState(false);
  const [saved, setSaved] = useState(false);

  function roll(next: Pick | null) {
    setSaved(false);
    setRolling(true);
    // A beat of "rewinding" before it lands.
    window.setTimeout(() => {
      setPick(next);
      setRolling(false);
    }, 450);
  }

  function saveForTonight() {
    if (!pick) return;
    const today = new Date().toISOString().slice(0, 10);
    setPlan({ date: today, showId: pick.show.id, season: pick.season, episode: pick.episode });
    setSaved(true);
  }

  const label = pick ? formatEpisode(pick) : null;

  return (
    <div className="tape rounded-md p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.65rem] uppercase tracking-[0.2em] text-vhs-dim">
        <span>mood</span>
        {MOODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMood(m.id)}
            className={`rounded-sm border px-2.5 py-1 transition-colors ${
              mood === m.id
                ? "border-vhs-cyan text-vhs-cyan"
                : "border-vhs-line text-vhs-dim hover:text-vhs-text"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-6 min-h-[120px]">
        {rolling ? (
          <p className="chroma text-2xl uppercase tracking-[0.2em] text-vhs-dim sm:text-3xl">
            ◀◀ rewinding…
          </p>
        ) : pick ? (
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.3em]" style={{ color: pick.show.color }}>
              tonight
            </p>
            <h3 className="chroma-soft mt-1 text-3xl font-bold leading-tight sm:text-4xl">
              {pick.show.title}
            </h3>
            {label ? (
              <p className="mt-1 text-sm tracking-[0.2em] text-vhs-amber">{label}</p>
            ) : null}
            <p className="mt-3 max-w-xl text-sm text-vhs-dim">{pick.reason}</p>
          </div>
        ) : (
          <p className="text-sm text-vhs-dim">
            Press a button and let the tape decide.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-[0.7rem] uppercase tracking-[0.2em]">
        <button
          type="button"
          disabled={!ready}
          onClick={() => roll(shuffle(shows, mood, pick?.show.id))}
          className="rounded-sm border border-vhs-magenta px-4 py-2 text-vhs-magenta transition-colors hover:bg-vhs-magenta/10"
        >
          ⇄ shuffle
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => roll(recommend(shows, plans))}
          className="rounded-sm border border-vhs-cyan px-4 py-2 text-vhs-cyan transition-colors hover:bg-vhs-cyan/10"
        >
          ★ what should we watch next
        </button>
        {pick ? (
          <button
            type="button"
            onClick={saveForTonight}
            className="rounded-sm border border-vhs-line px-4 py-2 text-vhs-dim transition-colors hover:text-vhs-amber"
          >
            {saved ? "✓ on the calendar" : "put it on tonight"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
