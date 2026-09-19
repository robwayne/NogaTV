"use client";

import { useState } from "react";
import { useStore, type Status } from "@/lib/store";

/** Add a show on the fly, straight from the page. */
export function AddShowForm({ defaultStatus }: { defaultStatus: Status }) {
  const { addShow } = useStore();
  const [title, setTitle] = useState("");
  const [years, setYears] = useState("");
  const [note, setNote] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addShow({ title, years, note, status: defaultStatus });
    setTitle("");
    setYears("");
    setNote("");
  }

  return (
    <form
      onSubmit={submit}
      className="tape grid gap-2 rounded-md border-dashed p-4 sm:grid-cols-[1.2fr_0.6fr_1.6fr_auto]"
    >
      <input
        className="field"
        placeholder="add a show…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Show title"
      />
      <input
        className="field"
        placeholder="years"
        value={years}
        onChange={(e) => setYears(e.target.value)}
        aria-label="Years"
      />
      <input
        className="field"
        placeholder="why"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        aria-label="Note"
      />
      <button
        type="submit"
        className="rounded-sm border border-vhs-line px-4 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-vhs-cyan transition-colors hover:border-vhs-cyan"
      >
        + add
      </button>
    </form>
  );
}
