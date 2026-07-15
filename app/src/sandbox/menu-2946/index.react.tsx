import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";

function NewItemActions() {
  const store = Ariakit.useMenuStore({ defaultOpen: true });

  useEffect(() => {
    // TODO: Remove after https://github.com/ariakit/ariakit/issues/2946
    store.setAutoFocusOnShow(true);
  }, [store]);

  return (
    <Ariakit.MenuProvider store={store}>
      <Ariakit.MenuButton>Actions for new item</Ariakit.MenuButton>
      <Ariakit.Menu modal={false}>
        <Ariakit.MenuItem>Rename</Ariakit.MenuItem>
        <Ariakit.MenuItem>Duplicate</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

export default function Example() {
  const [created, setCreated] = useState(false);

  if (!created) {
    return <button onClick={() => setCreated(true)}>Add item</button>;
  }

  return <NewItemActions />;
}
