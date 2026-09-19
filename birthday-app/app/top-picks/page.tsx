import { Page } from "@/components/Page";
import { TopPicks } from "@/components/TopPicks";

export default function TopPicksPage() {
  return (
    <Page index="07" title="Top picks" blurb="The hall of fame. Non-negotiable, already litigated.">
      <TopPicks />
    </Page>
  );
}
