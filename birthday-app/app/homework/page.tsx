import { Page } from "@/components/Page";
import { RecShuffler } from "@/components/RecShuffler";
import { Recommendations } from "@/components/Recommendations";

export default function HomeworkPage() {
  return (
    <Page index="06" title="Homework">
      <RecShuffler />
      <div className="mt-12">
        <Recommendations />
      </div>
    </Page>
  );
}
