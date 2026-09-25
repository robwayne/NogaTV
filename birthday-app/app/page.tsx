import { Page } from "@/components/Page";
import { TonightPicker } from "@/components/TonightPicker";

export default function TonightPage() {
  return (
    <Page index="01" title="What are we watching">
      <TonightPicker />
    </Page>
  );
}
