import { Page } from "@/components/Page";
import { RecShuffler } from "@/components/RecShuffler";
import { Recommendations } from "@/components/Recommendations";

export default function HomeworkPage() {
  return (
    <Page
      index="06"
      title="Homework"
      blurb="Shows, films and books we've forced on each other. Two shelves so we can keep score. Hit a button and it picks off one of them — or off both, if you can't be trusted to choose."
    >
      <RecShuffler />
      <div className="mt-12">
        <Recommendations />
      </div>
    </Page>
  );
}
