import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";

export default function Example() {
  return (
    <div className="grid gap-4">
      <List aria-label="Completed progress">
        <ListItem progress={1}>Ready for review</ListItem>
      </List>
      <List aria-label="Explicit unchecked state">
        <ListItem progress={1} checked={false}>
          Awaiting approval
        </ListItem>
      </List>
      <List aria-label="Explicit checked state">
        <ListItem progress={0.5} checked>
          Approved early
        </ListItem>
      </List>
    </div>
  );
}
