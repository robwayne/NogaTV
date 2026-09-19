import { Library } from "@/components/Library";
import { Page } from "@/components/Page";

export default function WatchlistPage() {
  return (
    <Page
      index="04"
      title="Shows we haven't watched yet"
      blurb="The pile. Rate them anyway — a rating here is a guess at how much we'll like it, and the recommender takes the guess seriously until real episode ratings replace it."
    >
      <Library status="watchlist" />
    </Page>
  );
}
