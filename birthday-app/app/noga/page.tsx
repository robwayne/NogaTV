import { Inspirations } from "@/components/Inspirations";
import { LockGate } from "@/components/LockGate";
import { Page } from "@/components/Page";
import { SITE } from "@/data/content";

export default function NogaPage() {
  return (
    <Page
      index="09"
      title={`What inspires me about ${SITE.herName}`}
    >
      <LockGate>
        <Inspirations />
      </LockGate>
    </Page>
  );
}
