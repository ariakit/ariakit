import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";

export default function Example() {
  return (
    // A guide alone makes bullet markers and joins them, with no guide after
    // the last row.
    <List $guide className="w-72 max-w-full">
      <ListItem>Meet at the trailhead</ListItem>
      <ListItem>Climb to the first lake</ListItem>
      <ListItem>Have lunch on the ridge</ListItem>
      <ListItem>Walk down through the forest</ListItem>
    </List>
  );
}
