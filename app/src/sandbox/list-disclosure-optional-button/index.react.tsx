import {
  List,
  ListDisclosure,
} from "@ariakit/ui/components/list.ariakit.react";
import * as React from "react";

export default function Example() {
  const [headings, setHeadings] = React.useState(false);
  // A hidden heading supplies false; zero must still render a button label.
  return (
    <div className="grid gap-4">
      <label>
        <input
          type="checkbox"
          checked={headings}
          onChange={(event) => setHeadings(event.target.checked)}
        />
        Show task headings
      </label>
      <List ordered>
        <li>
          <ListDisclosure button={headings && "Project tasks"}>
            Review assigned issues
          </ListDisclosure>
        </li>
        <li>
          <ListDisclosure button={0}>No pending tasks</ListDisclosure>
        </li>
      </List>
    </div>
  );
}
