import { ActivityFeed } from "@/components/ActivityFeed";
import { Hero } from "@/components/Hero";
import { Inspirations } from "@/components/Inspirations";
import { Library } from "@/components/Library";
import { ProfileBar } from "@/components/ProfileBar";
import { Schedule } from "@/components/Schedule";
import { Section } from "@/components/Section";
import { TonightPicker } from "@/components/TonightPicker";
import { TopPicks } from "@/components/TopPicks";
import { SITE } from "@/data/content";

export default function Page() {
  return (
    <main>
      <ProfileBar />
      <Hero />

      <Section
        id="tonight"
        index="01"
        title="What are we watching"
        blurb="Neither of us can make a decision, so here's a machine that makes it for us. Shuffle for chaos, or ask it properly and it'll actually think about it."
      >
        <TonightPicker />
      </Section>

      <Section
        id="schedule"
        index="02"
        title="The week"
        blurb="Claim a night, pick a thing. The nine o'clock standoff is hereby cancelled."
      >
        <Schedule />
      </Section>

      <Section
        id="watched"
        index="03"
        title="Shows we've watched"
        blurb="The evidence. Open any tape to rate an episode or leave a note nobody asked for."
      >
        <Library status="watched" />
      </Section>

      <Section
        id="watchlist"
        index="04"
        title="Shows we haven't watched yet"
        blurb="The pile. Grows faster than we get through it. Add whatever you want, it's not like it'll help."
      >
        <Library status="watchlist" />
      </Section>

      <Section
        id="log"
        index="05"
        title="The log"
        blurb="Every opinion either of us has put in writing. Held against us forever."
      >
        <ActivityFeed />
      </Section>

      <Section
        id="top"
        index="06"
        title="Top picks"
        blurb="The hall of fame. Non-negotiable, already litigated."
      >
        <TopPicks />
      </Section>

      <Section
        id="her"
        index="07"
        title={`What inspires me about ${SITE.herName}`}
        blurb="The sincere bit. Skip it if you want, I'll know."
      >
        <Inspirations />
      </Section>

      <footer className="mx-auto w-full max-w-5xl px-4 pb-16 text-[0.6rem] uppercase tracking-[0.3em] text-vhs-line">
        ■ stop — happy birthday, {SITE.herName}. eat something.
      </footer>
    </main>
  );
}
