import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";

export default function Example() {
  return (
    // Bullets replace the dashes of the basic list. There is no guide, so the
    // rows have no order.
    <List $marker="bullet" className="w-72 max-w-full">
      <ListItem>Fill the water bottles</ListItem>
      <ListItem>
        Check the weather forecast for the valley and the ridge
      </ListItem>
      <ListItem>Charge the headlamp</ListItem>
      <ListItem>Tell someone the route</ListItem>
    </List>
  );
}
