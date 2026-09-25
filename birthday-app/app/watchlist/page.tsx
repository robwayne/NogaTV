import { Library } from "@/components/Library";
import { Page } from "@/components/Page";

export default function WatchlistPage() {
  return (
    <Page index="04" title="Shows we haven't watched yet">
      <Library status="watchlist" />
    </Page>
  );
}
