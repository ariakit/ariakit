import * as Ariakit from "@ariakit/react";
import { useState } from "react";

interface NewItemActionsProps {
  modal?: boolean;
  autoFocusOnShow?: boolean;
  onClose: () => void;
}

function NewItemActions({
  modal,
  autoFocusOnShow,
  onClose,
}: NewItemActionsProps) {
  return (
    <Ariakit.MenuProvider
      defaultOpen
      // Unmounting on close lets the preview be replayed by hand without
      // reloading the page.
      setOpen={(open) => {
        if (open) return;
        onClose();
      }}
    >
      <Ariakit.MenuButton className="button">Actions</Ariakit.MenuButton>
      <Ariakit.Menu
        modal={modal}
        autoFocusOnShow={autoFocusOnShow}
        gutter={8}
        className="menu"
      >
        <Ariakit.MenuItem className="menu-item">Rename</Ariakit.MenuItem>
        <Ariakit.MenuItem className="menu-item">Duplicate</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

type Variant = "default" | "modal" | "quiet";

// Adding an item mounts its actions already open, the way a real flow reveals
// the next available actions without a second click. The button that was
// clicked keeps focus, so the menu has to take focus away from a live element
// rather than from a blank body.
export default function Example() {
  const [added, setAdded] = useState<Variant | null>(null);
  const close = () => setAdded(null);

  return (
    <div>
      <div>
        <Ariakit.Button className="button" onClick={() => setAdded("default")}>
          Add item
        </Ariakit.Button>
        {added === "default" && <NewItemActions onClose={close} />}
      </div>
      <div>
        <Ariakit.Button className="button" onClick={() => setAdded("modal")}>
          Add modal item
        </Ariakit.Button>
        {added === "modal" && <NewItemActions modal onClose={close} />}
      </div>
      <div>
        <Ariakit.Button className="button" onClick={() => setAdded("quiet")}>
          Add quiet item
        </Ariakit.Button>
        {added === "quiet" && (
          <NewItemActions autoFocusOnShow={false} onClose={close} />
        )}
      </div>
    </div>
  );
}
