import { Page } from "@/components/Page";
import { Schedule } from "@/components/Schedule";

export default function SchedulePage() {
  return (
    <Page
      index="02"
      title="The week"
      blurb="Claim a night, pick a thing. The nine o'clock standoff is hereby cancelled."
    >
      <Schedule />
    </Page>
  );
}
