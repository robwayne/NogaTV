"use client";

import { useState } from "react";
import { SERVICES } from "@/lib/services";
import { useStore, type Status } from "@/lib/store";

/** Add a show on the fly, straight from the page. */
export function AddShowForm({ defaultStatus }: { defaultStatus: Status }) {
  const { addShow } = useStore();
  const [title, setTitle] = useState("");
  const [years, setYears] = useState("");
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<"show" | "movie">("show");
  const [service, setService] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addShow({ title, years, note, status: defaultStatus, kind, service: service || undefined });
    setTitle("");
    setYears("");
    setNote("");
    setService("");
  }

  return (
    <form
      onSubmit={submit}
      className="tape grid gap-2 rounded-md border-dashed p-4 sm:grid-cols-[1.1fr_0.5fr_1.2fr_0.8fr_auto_auto]"
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
      <select
        className="field"
        value={service}
        onChange={(e) => setService(e.target.value)}
        aria-label="Where to watch (optional)"
      >
        <option value="">where? (optional)</option>
        {SERVICES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setKind((k) => (k === "show" ? "movie" : "show"))}
        className="rounded-sm border border-vhs-line px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-vhs-dim transition-colors hover:text-vhs-amber"
        aria-label={`Currently adding a ${kind}. Click to switch.`}
      >
        {kind}
      </button>
      <button
        type="submit"
        className="rounded-sm border border-vhs-line px-4 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-vhs-cyan transition-colors hover:border-vhs-cyan"
      >
        + add
      </button>
    </form>
  );
}
