"use client";

import { useMemo, useState } from "react";
import { ServiceBadge } from "@/components/ServiceBadge";
import { randomEpisode } from "@/lib/recommend";
import { useStore } from "@/lib/store";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeek(offsetWeeks: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay() + offsetWeeks * 7);
  return d;
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Pick what we're watching on which night. */
export function Schedule() {
  const { ready, shows, plans, setPlan, clearPlan, byId, serviceFor } = useStore();
  const [week, setWeek] = useState(0);

  const days = useMemo(() => {
    const start = startOfWeek(week);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [week]);

  const today = iso(new Date());

  if (!ready) return <div className="h-64 animate-pulse rounded-md bg-vhs-panel" />;

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.2em]">
        <button
          type="button"
          onClick={() => setWeek((w) => w - 1)}
          className="text-vhs-dim hover:text-vhs-amber"
        >
          ◀ prev
        </button>
        <span className="text-vhs-cyan">
          {week === 0 ? "this week" : week === 1 ? "next week" : `week ${week > 0 ? "+" : ""}${week}`}
        </span>
        <button
          type="button"
          onClick={() => setWeek((w) => w + 1)}
          className="text-vhs-dim hover:text-vhs-amber"
        >
          next ▶
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {days.map((d) => {
          const key = iso(d);
          const plan = plans.find((p) => p.date === key);
          const show = plan ? byId(plan.showId) : undefined;
          const isToday = key === today;

          return (
            <div
              key={key}
              className="tape rounded-md p-3"
              style={{
                ["--tape-color" as string]: show?.color ?? "#9b91c4",
                borderColor: isToday ? "var(--color-vhs-amber)" : undefined,
              }}
            >
              <div className="flex items-baseline justify-between text-[0.6rem] uppercase tracking-[0.2em]">
                <span className={isToday ? "text-vhs-amber" : "text-vhs-dim"}>
                  {DAYS[d.getDay()]}
                </span>
                <span className="flex items-center gap-2 text-vhs-line">
                  {show ? (
                    <ServiceBadge
                      id={serviceFor(show.id).id}
                      fallback={!serviceFor(show.id).chosen}
                      size="xs"
                    />
                  ) : null}
                  {d.getMonth() + 1}/{d.getDate()}
                </span>
              </div>

              {show ? (
                <p className="mt-2 text-sm font-bold leading-snug" style={{ color: show.color }}>
                  {show.title}
                  {plan?.season && plan?.episode ? (
                    <span className="block text-[0.65rem] font-normal tracking-[0.2em] text-vhs-dim">
                      S{String(plan.season).padStart(2, "0")}E
                      {String(plan.episode).padStart(2, "0")}
                    </span>
                  ) : null}
                </p>
              ) : (
                <p className="mt-2 text-xs text-vhs-line">nothing planned</p>
              )}

              <select
                className="field mt-3"
                value={plan?.showId ?? ""}
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id) return clearPlan(key);
                  const picked = shows.find((s) => s.id === id);
                  const ep = picked ? randomEpisode(picked) : {};
                  setPlan({ date: key, showId: id, ...ep });
                }}
                aria-label={`What we're watching on ${DAYS[d.getDay()]}`}
              >
                <option value="">pick one</option>
                {shows.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
