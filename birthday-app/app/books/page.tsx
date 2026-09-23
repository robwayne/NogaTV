import { Bookshelf } from "@/components/Bookshelf";
import { Page } from "@/components/Page";

export default function BooksPage() {
  return (
    <Page
      index="07"
      title="The Shelf"
      blurb="Books have nothing to do with television and have been moved out accordingly. Three shelves — reading, meaning to, and actually finished — plus a slider for how far in you are, which is mostly there so we can lie to each other about it."
    >
      <Bookshelf />
    </Page>
  );
}
