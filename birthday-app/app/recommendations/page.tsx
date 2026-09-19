import Link from "next/link";
import { ProfileBar } from "@/components/ProfileBar";
import { RecShuffler } from "@/components/RecShuffler";
import { Recommendations } from "@/components/Recommendations";
import { SITE } from "@/data/content";

export const metadata = {
  title: `Recommendations — ${SITE.title}`,
  description: "Everything we've made each other watch and read.",
};

export default function RecommendationsPage() {
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
          Homework
        </h1>
        <p className="mt-3 text-sm uppercase tracking-[0.25em] text-vhs-cyan">
          things we&apos;ve forced on each other
        </p>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-vhs-dim">
          Shows, films and books. Two shelves so we can keep score. Hit a button below and it picks
          something off one of them — or off both, if you can&apos;t be trusted to choose. Anything
          already ticked off gets skipped, which is the closest thing to a reward system either of us
          responds to.
        </p>

        <div className="mt-8">
          <RecShuffler />
        </div>

        <div className="mt-12">
          <Recommendations />
        </div>
      </div>
    </main>
  );
}
