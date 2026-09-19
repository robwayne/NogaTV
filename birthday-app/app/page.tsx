import { Page } from "@/components/Page";
import { TonightPicker } from "@/components/TonightPicker";
import { SITE } from "@/data/content";

export default function TonightPage() {
  return (
    <Page
      index="01"
      title="What are we watching"
      blurb={`${SITE.dedication} Neither of us can make a decision, so here's a machine that makes it for us.`}
    >
      <TonightPicker />
    </Page>
  );
}
