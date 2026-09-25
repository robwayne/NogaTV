import { ActivityFeed } from "@/components/ActivityFeed";
import { Page } from "@/components/Page";

export default function LogPage() {
  return (
    <Page index="05" title="The log">
      <ActivityFeed />
    </Page>
  );
}
