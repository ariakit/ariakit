import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [created, setCreated] = useState(false);

  if (!created) {
    return <button onClick={() => setCreated(true)}>Add item</button>;
  }

  return (
    <Ariakit.MenuProvider defaultOpen>
      <Ariakit.MenuButton>Actions for new item</Ariakit.MenuButton>
      <Ariakit.Menu modal={false}>
        <Ariakit.MenuItem>Rename</Ariakit.MenuItem>
        <Ariakit.MenuItem>Duplicate</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}
