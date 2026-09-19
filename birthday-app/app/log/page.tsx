import { ActivityFeed } from "@/components/ActivityFeed";
import { Page } from "@/components/Page";

export default function LogPage() {
  return (
    <Page
      index="05"
      title="The log"
      blurb="Every opinion either of us has put in writing. Held against us forever."
    >
      <ActivityFeed />
    </Page>
  );
}
