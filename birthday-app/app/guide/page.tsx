import { Page } from "@/components/Page";
import { TvGuide } from "@/components/TvGuide";

export default function GuidePage() {
  return (
    <Page
      index="08"
      title="The Guide"
      blurb="One channel per show, each running its own 24/7 marathon, because apparently that's what I do with my free time now. The time slots aren't a broadcast order — they're episode recommendations, best first, so the ones we haven't watched or rate highest turn up early and nothing repeats until the show runs out. Rebuilds itself every day at midnight. Point it at what we've already seen or only at what we haven't."
    >
      <TvGuide />
    </Page>
  );
}
