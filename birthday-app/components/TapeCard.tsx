"use client";

import { useState } from "react";
import { Stars } from "@/components/Stars";
import { useStore, type LibraryShow } from "@/lib/store";

function Spine({ show }: { show: LibraryShow }) {
  return (
    <div
      className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-sm border text-[0.7rem] font-bold tracking-widest"
      style={{
        borderColor: show.color,
        color: show.color,
        background: `linear-gradient(160deg, ${show.color}22, transparent)`,
        boxShadow: `inset 0 0 18px -8px ${show.color}`,
      }}
    >
      {show.initials}
      <span className="mt-1 h-px w-6" style={{ background: show.color }} />
    </div>
  );
}

export function TapeCard({ show }: { show: LibraryShow }) {
  const { activeProfile, profiles, entriesForShow, addEntry, removeEntry, setStatus, removeShow } =
    useStore();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [season, setSeason] = useState("");
  const [episode, setEpisode] = useState("");

  const entries = entriesForShow(show.id);
  const nameOf = (id: string) => profiles.find((p) => p.id === id)?.name ?? "someone";
  const colorOf = (id: string) => profiles.find((p) => p.id === id)?.color ?? "#9b91c4";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeProfile || (!text.trim() && !rating)) return;
    addEntry({
      showId: show.id,
      rating,
      text: text.trim(),
      season: season ? Number(season) : undefined,
      episode: episode ? Number(episode) : undefined,
    });
    setText("");
    setRating(0);
    setEpisode("");
  }

  return (
    <article
      className="tape rounded-md p-4 transition-all"
      style={{ ["--tape-color" as string]: show.color }}
    >
      <div className="flex gap-4">
        <Spine show={show} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h3 className="text-base font-bold tracking-wide">{show.title}</h3>
            {show.years ? (
              <span className="text-[0.7rem] tracking-widest text-vhs-dim">{show.years}</span>
            ) : null}
          </div>

          {show.progress ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1 w-28 overflow-hidden rounded-full bg-vhs-line">
                <div
                  className="h-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (show.progress.seasonsWatched / Math.max(1, show.progress.seasonsTotal)) * 100,
                    )}%`,
                    background: show.color,
                  }}
                />
              </div>
              <span className="text-[0.65rem] tracking-widest text-vhs-dim">
                {show.progress.seasonsWatched}/{show.progress.seasonsTotal} seasons
              </span>
            </div>
          ) : null}

          {show.note ? (
            <p className="mt-2 text-sm leading-relaxed text-vhs-dim">{show.note}</p>
          ) : null}

          {show.quote ? (
            <p className="mt-2 border-l-2 pl-3 text-sm italic" style={{ borderColor: show.color }}>
              “{show.quote}”
            </p>
          ) : null}

          {show.favoriteEpisode ? (
            <p className="mt-2 text-[0.7rem] uppercase tracking-[0.15em] text-vhs-dim">
              best episode · <span className="text-vhs-text">{show.favoriteEpisode}</span>
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.65rem] uppercase tracking-[0.2em]">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="text-vhs-cyan hover:text-vhs-amber"
            >
              {open ? "hide log" : `log${entries.length ? ` (${entries.length})` : ""}`}
            </button>
            <button
              type="button"
              onClick={() => setStatus(show.id, show.status === "watched" ? "watchlist" : "watched")}
              className="text-vhs-dim hover:text-vhs-amber"
            >
              {show.status === "watched" ? "move to watchlist" : "mark watched"}
            </button>
            {show.custom ? (
              <button
                type="button"
                onClick={() => removeShow(show.id)}
                className="text-vhs-dim hover:text-vhs-magenta"
              >
                remove
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {open ? (
        <div className="mt-4 border-t border-vhs-line pt-4">
          <form onSubmit={submit} className="grid gap-2 sm:grid-cols-[auto_5rem_5rem_1fr_auto] sm:items-center">
            <Stars value={rating} onChange={setRating} />
            <input
              className="field"
              placeholder="S"
              inputMode="numeric"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              aria-label="Season"
            />
            <input
              className="field"
              placeholder="E"
              inputMode="numeric"
              value={episode}
              onChange={(e) => setEpisode(e.target.value)}
              aria-label="Episode"
            />
            <input
              className="field"
              placeholder={activeProfile ? "what did you think?" : "pick a profile above first"}
              value={text}
              disabled={!activeProfile}
              onChange={(e) => setText(e.target.value)}
              aria-label="Comment"
            />
            <button
              type="submit"
              disabled={!activeProfile}
              className="rounded-sm border border-vhs-line px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-vhs-cyan transition-colors hover:border-vhs-cyan disabled:opacity-40"
            >
              log it
            </button>
          </form>

          <ul className="mt-4 space-y-3">
            {entries.length === 0 ? (
              <li className="text-xs text-vhs-dim">Nothing logged yet.</li>
            ) : null}
            {entries.map((e) => (
              <li key={e.id} className="text-sm">
                <div className="flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.15em]">
                  <span style={{ color: colorOf(e.profileId) }}>{nameOf(e.profileId)}</span>
                  {e.season && e.episode ? (
                    <span className="text-vhs-dim">
                      S{String(e.season).padStart(2, "0")}E{String(e.episode).padStart(2, "0")}
                    </span>
                  ) : null}
                  {e.rating ? <Stars value={e.rating} /> : null}
                  <span className="text-vhs-line">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEntry(e.id)}
                    className="text-vhs-line hover:text-vhs-magenta"
                    aria-label="Delete entry"
                  >
                    ✕
                  </button>
                </div>
                {e.text ? <p className="mt-1 text-vhs-dim">{e.text}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
