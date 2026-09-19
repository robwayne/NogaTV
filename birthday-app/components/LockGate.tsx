"use client";

import { useEffect, useState } from "react";
import { LOCK } from "@/data/content";
import { checkPassword, nextOpening, windowIsOpen } from "@/lib/lock";

const UNLOCKED_KEY = "tapes.unlocked";

/**
 * Keeps the inspiration page shut except during the birthday window, or with
 * the password. Unlocking sticks for the browser session only.
 */
export function LockGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [wrong, setWrong] = useState(false);

  useEffect(() => {
    setMounted(true);
    let remembered = false;
    try {
      remembered = window.sessionStorage.getItem(UNLOCKED_KEY) === "1";
    } catch {
      /* private browsing — they can just type it again */
    }
    setOpen(windowIsOpen() || remembered);
  }, []);

  // Don't render either branch until we know which, so the locked page never
  // flashes the contents on its way to the password form.
  if (!mounted) return <div className="h-64" />;

  if (open) return <>{children}</>;

  const opens = nextOpening();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkPassword(input)) {
      setWrong(true);
      return;
    }
    try {
      window.sessionStorage.setItem(UNLOCKED_KEY, "1");
    } catch {
      /* fine — it just won't be remembered */
    }
    setOpen(true);
  }

  return (
    <div className="tape mx-auto max-w-lg rounded-md p-6 text-center sm:p-8">
      <div className="text-[0.6rem] uppercase tracking-[0.35em] text-vhs-magenta">
        ▮▮ sealed tape
      </div>
      <h2 className="chroma-soft mt-3 text-2xl font-bold uppercase tracking-[0.15em]">
        Not yet
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-vhs-dim">
        This one opens on{" "}
        <span className="text-vhs-amber">
          {opens.toLocaleDateString(undefined, { month: "long", day: "numeric" })}
        </span>{" "}
        and stays open for {LOCK.openDays} days. After that it goes back in the box.
      </p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-2 sm:flex-row">
        <input
          type="password"
          className="field"
          placeholder="or say the password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setWrong(false);
          }}
          aria-label="Password"
        />
        <button
          type="submit"
          className="rounded-sm border border-vhs-cyan px-4 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-vhs-cyan transition-colors hover:bg-vhs-cyan/10"
        >
          unlock
        </button>
      </form>

      {wrong ? (
        <p className="mt-3 text-xs text-vhs-magenta">Nope. Have another think.</p>
      ) : null}
    </div>
  );
}
