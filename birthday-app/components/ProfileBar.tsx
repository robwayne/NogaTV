"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

/** "Who's watching?" — picks whose name goes on the log entries. */
export function ProfileBar() {
  const { ready, profiles, activeProfile, setActiveProfile, renameProfile } = useStore();
  const [editing, setEditing] = useState(false);

  if (!ready) return <div className="h-[46px]" />;

  return (
    <div className="sticky top-0 z-40 border-b border-vhs-line bg-vhs-bg/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-3 px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.2em]">
        <span className="text-vhs-dim">Watching as</span>

        {profiles.map((p) => {
          const active = activeProfile?.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveProfile(active ? null : p.id)}
              className="rounded-sm border px-2.5 py-1 transition-colors"
              style={{
                borderColor: active ? p.color : "var(--color-vhs-line)",
                color: active ? p.color : "var(--color-vhs-dim)",
                boxShadow: active ? `0 0 14px -6px ${p.color}` : undefined,
              }}
            >
              {p.name}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="ml-auto text-vhs-dim underline-offset-4 hover:text-vhs-amber hover:underline"
        >
          {editing ? "done" : "rename"}
        </button>
      </div>

      {editing ? (
        <div className="mx-auto flex w-full max-w-5xl flex-wrap gap-2 px-4 pb-3">
          {profiles.map((p) => (
            <input
              key={p.id}
              className="field max-w-[180px]"
              defaultValue={p.name}
              aria-label={`Name for profile ${p.name}`}
              onBlur={(e) => renameProfile(p.id, e.target.value)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
