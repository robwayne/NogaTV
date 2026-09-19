"use client";

import { AddShowForm } from "@/components/AddShowForm";
import { TapeCard } from "@/components/TapeCard";
import { useStore, type Status } from "@/lib/store";

export function Library({ status }: { status: Status }) {
  const { ready, watched, watchlist } = useStore();
  const shows = status === "watched" ? watched : watchlist;

  if (!ready) return <div className="h-40 animate-pulse rounded-md bg-vhs-panel" />;

  return (
    <div className="space-y-3">
      {shows.map((show) => (
        <TapeCard key={show.id} show={show} />
      ))}
      <AddShowForm defaultStatus={status} />
    </div>
  );
}
