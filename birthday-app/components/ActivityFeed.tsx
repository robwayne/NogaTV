"use client";

import { Stars } from "@/components/Stars";
import { useStore } from "@/lib/store";

/** The Letterboxd-ish feed: everything either of us has logged, newest first. */
export function ActivityFeed() {
  const { ready, entries, byId, profiles } = useStore();
  if (!ready) return null;

  if (entries.length === 0) {
    return (
      <p className="text-sm text-vhs-dim">
        Nothing logged yet. Open any tape below and leave the first note.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {entries.slice(0, 12).map((e) => {
        const show = byId(e.showId);
        const who = profiles.find((p) => p.id === e.profileId);
        return (
          <li key={e.id} className="tape rounded-md p-4">
            <div className="flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.15em]">
              <span style={{ color: who?.color ?? "#9b91c4" }}>{who?.name ?? "someone"}</span>
              <span className="text-vhs-dim">on</span>
              <span style={{ color: show?.color }}>{show?.title ?? "a show"}</span>
              {e.season && e.episode ? (
                <span className="text-vhs-dim">
                  S{String(e.season).padStart(2, "0")}E{String(e.episode).padStart(2, "0")}
                </span>
              ) : null}
              {e.rating ? <Stars value={e.rating} /> : null}
            </div>
            {e.text ? <p className="mt-2 text-sm text-vhs-dim">{e.text}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}
