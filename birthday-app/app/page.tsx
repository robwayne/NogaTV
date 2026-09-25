import { Page } from "@/components/Page";
import { TonightPicker } from "@/components/TonightPicker";
import { SITE } from "@/data/content";

export default function TonightPage() {
  return (
    <Page index="01" title="What are we watching">
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-vhs-dim">{SITE.dedication}</p>
      <TonightPicker />
    </Page>
  );
}
