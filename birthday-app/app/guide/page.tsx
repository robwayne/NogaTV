import Link from "next/link";
import { ProfileBar } from "@/components/ProfileBar";
import { TvGuide } from "@/components/TvGuide";
import { SITE } from "@/data/content";

export const metadata = {
  title: `TV Guide — ${SITE.title}`,
  description: "A day of listings built out of everything in our library.",
};

export default function GuidePage() {
  return (
    <main>
      <ProfileBar />

      <div className="mx-auto w-full max-w-5xl px-4 pt-10 pb-16 sm:pt-16">
        <Link
          href="/"
          className="text-[0.65rem] uppercase tracking-[0.25em] text-vhs-dim hover:text-vhs-amber"
        >
          ◀ back to the tapes
        </Link>

        <h1 className="chroma mt-6 text-4xl font-bold uppercase leading-none tracking-tight sm:text-6xl">
          The Guide
        </h1>
        <p className="mt-3 text-sm uppercase tracking-[0.25em] text-vhs-cyan">
          cable never went off the air
        </p>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-vhs-dim">
          Every channel is built from our own library — the shows, the watchlist, the movies, even
          the ones {SITE.herName} rated highest. The listings are seeded off today&apos;s date, so
          the schedule holds all day and turns over at midnight. Click any block to hold it on
          screen, or let it scroll.
        </p>

        <div className="mt-8">
          <TvGuide />
        </div>
      </div>
    </main>
  );
}
