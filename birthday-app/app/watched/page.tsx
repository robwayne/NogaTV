import { Library } from "@/components/Library";
import { Page } from "@/components/Page";

export default function WatchedPage() {
  return (
    <Page index="03" title="Shows we've watched">
      <Library status="watched" />
    </Page>
  );
}
