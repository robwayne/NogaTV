"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/data/content";
import { windowIsOpen } from "@/lib/lock";

const PAGES = [
  { href: "/", label: "Tonight" },
  { href: "/guide", label: "TV Guide" },
  { href: "/schedule", label: "The Week" },
  { href: "/watched", label: "Watched" },
  { href: "/watchlist", label: "To Watch" },
  { href: "/log", label: "The Log" },
  { href: "/homework", label: "Homework" },
  { href: "/books", label: "Books" },
  { href: "/top-picks", label: "Top Picks" },
  // Only appears during the birthday window; the page itself stays reachable
  // with the password the rest of the year.
  { href: "/noga", label: SITE.herName, locked: true },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  // With trailingSlash on, the deployed paths come through as "/guide/".
  const current = pathname.replace(/\/+$/, "") || "/";
  const here = PAGES.find((p) => p.href === current);

  // The window depends on today's date, so it can only be decided in the
  // browser — the pre-rendered HTML always hides the link.
  useEffect(() => setUnlocked(windowIsOpen()), []);

  // Navigating closes it.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!panel.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <nav className="relative border-b border-vhs-line bg-vhs-bg/90 backdrop-blur" ref={panel}>
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="main-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-8 w-8 shrink-0 flex-col items-center justify-center gap-[5px] rounded-sm border border-vhs-line transition-colors hover:border-vhs-amber"
        >
          {/* the three lines, folding into an × when open */}
          <span
            className={`block h-px w-4 bg-vhs-text transition-transform duration-200 ${
              open ? "translate-y-[6px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-4 bg-vhs-text transition-opacity duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-px w-4 bg-vhs-text transition-transform duration-200 ${
              open ? "-translate-y-[6px] -rotate-45" : ""
            }`}
          />
        </button>

        <Link href="/" className="chroma-soft text-sm font-bold uppercase tracking-[0.2em]">
          The Tapes
        </Link>

        {/* Where you are, since the menu is closed most of the time. */}
        {here ? (
          <span className="truncate text-[0.65rem] uppercase tracking-[0.2em] text-vhs-dim">
            <span className="text-vhs-line">/</span> {here.label}
          </span>
        ) : null}
      </div>

      {open ? (
        <div
          id="main-menu"
          className="absolute left-0 right-0 top-full z-50 border-b border-vhs-line bg-vhs-bg shadow-[0_20px_40px_-10px_#000]"
        >
          <ul className="mx-auto w-full max-w-5xl px-4 py-2">
            {PAGES.filter((page) => !page.locked || unlocked).map((page) => {
              const active = current === page.href;
              return (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 border-b border-vhs-line/50 py-3 text-[0.75rem] uppercase tracking-[0.2em] transition-colors last:border-b-0 ${
                      active ? "text-vhs-amber" : "text-vhs-dim hover:text-vhs-text"
                    }`}
                  >
                    <span className={active ? "text-vhs-amber" : "text-vhs-line"}>
                      {active ? "▶" : "·"}
                    </span>
                    {page.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
