"use client";

import { useState } from "react";
import { useStore, type LibraryRec } from "@/lib/store";
import { SITE } from "@/data/content";
import type { Rec } from "@/data/content";

const KIND_LABEL: Record<Rec["kind"], string> = {
  show: "show",
  film: "film",
  book: "book",
};

function RecRow({ rec }: { rec: LibraryRec }) {
  const { toggleRecDone, removeRec } = useStore();
  return (
    <li className="tape flex items-start gap-3 rounded-md p-3">
      <button
        type="button"
        onClick={() => toggleRecDone(rec.id)}
        aria-label={rec.done ? "Mark as not done" : "Mark as done"}
        className={`mt-0.5 h-4 w-4 shrink-0 rounded-sm border text-[0.6rem] leading-none ${
          rec.done
            ? "border-vhs-amber bg-vhs-amber/20 text-vhs-amber"
            : "border-vhs-line text-transparent hover:border-vhs-amber"
        }`}
      >
        ✓
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className={`text-sm font-bold ${rec.done ? "text-vhs-dim line-through" : ""}`}>
            {rec.title}
          </span>
          {rec.year ? <span className="text-[0.65rem] text-vhs-line">{rec.year}</span> : null}
          <span className="text-[0.6rem] uppercase tracking-[0.2em] text-vhs-cyan">
            {KIND_LABEL[rec.kind]}
          </span>
        </div>
        {rec.note ? <p className="mt-1 text-xs leading-relaxed text-vhs-dim">{rec.note}</p> : null}
      </div>

      {rec.custom ? (
        <button
          type="button"
          onClick={() => removeRec(rec.id)}
          className="text-vhs-line hover:text-vhs-magenta"
          aria-label="Remove"
        >
          ✕
        </button>
      ) : null}
    </li>
  );
}

function AddRecForm({ by }: { by: "me" | "her" }) {
  const { addRec } = useStore();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<Rec["kind"]>("show");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        addRec({ title, note, kind, by });
        setTitle("");
        setNote("");
      }}
      className="tape grid gap-2 rounded-md border-dashed p-3 sm:grid-cols-[1.2fr_1.4fr_auto_auto]"
    >
      <input
        className="field"
        placeholder="add one…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Title"
      />
      <input
        className="field"
        placeholder="the pitch"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        aria-label="Note"
      />
      <button
        type="button"
        onClick={() =>
          setKind((k) => (k === "show" ? "film" : k === "film" ? "book" : "show"))
        }
        className="rounded-sm border border-vhs-line px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-vhs-dim hover:text-vhs-amber"
        aria-label={`Currently adding a ${kind}. Click to change.`}
      >
        {kind}
      </button>
      <button
        type="submit"
        className="rounded-sm border border-vhs-line px-4 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-vhs-cyan hover:border-vhs-cyan"
      >
        + add
      </button>
    </form>
  );
}

/** Two shelves, side by side: what I made her sit through, and what she made me. */
export function Recommendations() {
  const { ready, recs, profiles } = useStore();
  if (!ready) return <div className="h-64 animate-pulse rounded-md bg-vhs-panel" />;

  const myName = profiles.find((p) => p.id === "me")?.name ?? SITE.fromName;

  const shelves: { by: "me" | "her"; title: string; sub: string; tint: string }[] = [
    {
      by: "me",
      title: `${myName} made ${SITE.herName} watch this`,
      sub: "A campaign, really. Mostly successful.",
      tint: "var(--color-vhs-cyan)",
    },
    {
      by: "her",
      title: `${SITE.herName} made ${myName} watch this`,
      sub: "Better taste. Annoying about it.",
      tint: "var(--color-vhs-magenta)",
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {shelves.map((shelf) => {
        const items = recs.filter((r) => r.by === shelf.by);
        const done = items.filter((r) => r.done).length;
        return (
          <section key={shelf.by}>
            <h3
              className="text-sm font-bold uppercase tracking-[0.15em]"
              style={{ color: shelf.tint }}
            >
              {shelf.title}
            </h3>
            <p className="mt-1 text-xs text-vhs-dim">{shelf.sub}</p>
            <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-vhs-line">
              {done}/{items.length} actually got done
            </p>

            <ul className="mt-4 space-y-2">
              {items.map((rec) => (
                <RecRow key={rec.id} rec={rec} />
              ))}
              <li>
                <AddRecForm by={shelf.by} />
              </li>
            </ul>
          </section>
        );
      })}
    </div>
  );
}
