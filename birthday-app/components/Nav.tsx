"use client";

import { useEffect, useState } from "react";
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
  const [unlocked, setUnlocked] = useState(false);

  // The window depends on today's date, so it can only be decided in the
  // browser — the pre-rendered HTML always hides the link.
  useEffect(() => setUnlocked(windowIsOpen()), []);
  // With trailingSlash on, the deployed paths come through as "/guide/".
  const current = pathname.replace(/\/+$/, "") || "/";

  return (
    <nav className="border-b border-vhs-line bg-vhs-bg/90 backdrop-blur">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="flex items-center gap-3 py-2.5">
          <Link
            href="/"
            className="chroma-soft shrink-0 text-sm font-bold uppercase tracking-[0.2em]"
          >
            The Tapes
          </Link>
        </div>

        {/* Scrolls sideways on a phone rather than wrapping into a wall. */}
        <div className="-mx-4 overflow-x-auto px-4 pb-2">
          <ul className="flex gap-x-5 whitespace-nowrap text-[0.7rem] uppercase tracking-[0.2em]">
            {PAGES.filter((page) => !page.locked || unlocked).map((page) => {
              const active = current === page.href;
              return (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-block border-b-2 pb-1 transition-colors ${
                      active
                        ? "border-vhs-amber text-vhs-amber"
                        : "border-transparent text-vhs-dim hover:text-vhs-text"
                    }`}
                  >
                    {page.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
