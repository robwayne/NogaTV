import { Library } from "@/components/Library";
import { Page } from "@/components/Page";

export default function WatchedPage() {
  return (
    <Page
      index="03"
      title="Shows we've watched"
      blurb="The evidence. Rate the show, rate individual episodes, leave a note nobody asked for, or remove it entirely if it's not worth defending."
    >
      <Library status="watched" />
    </Page>
  );
}
