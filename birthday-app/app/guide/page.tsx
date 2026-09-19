import { Page } from "@/components/Page";
import { TvGuide } from "@/components/TvGuide";

export default function GuidePage() {
  return (
    <Page
      index="08"
      title="The Guide"
      blurb="Eight channels, all of them built out of our own library, because apparently that's what I do with my free time now. Runs midnight to midnight and rebuilds itself every day. It favours the episodes we've watched least and rate highest, and you can point it at what we've already seen or only at what we haven't."
    >
      <TvGuide />
    </Page>
  );
}
