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
        blurb="Let the tape pick, or ask for a real recommendation based on what we've already scheduled."
      >
        <TonightPicker />
      </Section>

      <Section
        id="schedule"
        index="02"
        title="The week"
        blurb="Claim a night. Pick a show. Nobody has to negotiate at 9pm again."
      >
        <Schedule />
      </Section>

      <Section
        id="watched"
        index="03"
        title="Shows we've watched"
        blurb="The catalogue. Open any tape to rate an episode or leave a note."
      >
        <Library status="watched" />
      </Section>

      <Section
        id="watchlist"
        index="04"
        title="Shows we haven't watched yet"
        blurb="Everything still ahead of us. Add anything, any time."
      >
        <Library status="watchlist" />
      </Section>

      <Section id="log" index="05" title="The log" blurb="Everything we've said about everything.">
        <ActivityFeed />
      </Section>

      <Section id="top" index="06" title="Top picks" blurb="The hall of fame.">
        <TopPicks />
      </Section>

      <Section
        id="her"
        index="07"
        title={`What inspires me about ${SITE.herName}`}
        blurb="The part that isn't about television."
      >
        <Inspirations />
      </Section>

      <footer className="mx-auto w-full max-w-5xl px-4 pb-16 text-[0.6rem] uppercase tracking-[0.3em] text-vhs-line">
        ■ stop — happy birthday, {SITE.herName}
      </footer>
    </main>
  );
}
