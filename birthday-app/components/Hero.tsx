import Link from "next/link";
import { SITE } from "@/data/content";

const NAV = [
  { href: "/guide", label: "★ TV Guide" },
  { href: "/recommendations", label: "★ Homework" },
  { href: "#tonight", label: "Tonight" },
  { href: "#schedule", label: "Schedule" },
  { href: "#watched", label: "Watched" },
  { href: "#watchlist", label: "To Watch" },
  { href: "#top", label: "Top Picks" },
  { href: "#her", label: "Her" },
];

export function Hero() {
  return (
    <header className="relative mx-auto w-full max-w-5xl px-4 pt-14 pb-6 sm:pt-24">
      <div className="mb-6 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-vhs-dim">
        <span className="blink text-vhs-magenta">●</span>
        <span>REC</span>
        <span className="text-vhs-line">|</span>
        <span>SP</span>
        <span className="text-vhs-line">|</span>
        <span>for {SITE.herName}</span>
      </div>

      <h1 className="chroma text-5xl font-bold uppercase leading-none tracking-tight sm:text-7xl">
        {SITE.title}
      </h1>
      <p className="mt-3 text-sm uppercase tracking-[0.25em] text-vhs-cyan sm:text-base">
        {SITE.subtitle}
      </p>
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-vhs-dim">{SITE.dedication}</p>

      <nav className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-[0.7rem] uppercase tracking-[0.2em]">
        {NAV.map((item) =>
          // Routed pages go through Link so they pick up the base path the
          // site is deployed under; in-page anchors stay plain.
          item.href.startsWith("/") ? (
            <Link
              key={item.href}
              href={item.href}
              className="text-vhs-dim transition-colors hover:text-vhs-amber"
            >
              {item.label}
            </Link>
          ) : (
            <a
              key={item.href}
              href={item.href}
              className="text-vhs-dim transition-colors hover:text-vhs-amber"
            >
              {item.label}
            </a>
          ),
        )}
      </nav>
    </header>
  );
}
