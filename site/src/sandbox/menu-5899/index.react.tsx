import * as Ariakit from "@ariakit/react";
import type { KeyboardEvent } from "react";

interface MenuExampleProps {
  name: string;
}

function MenuItems() {
  return (
    <>
      <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
      <Ariakit.MenuItem>Share</Ariakit.MenuItem>
      <Ariakit.MenuItem disabled>Delete</Ariakit.MenuItem>
      <Ariakit.MenuSeparator />
      <Ariakit.MenuItem>Report</Ariakit.MenuItem>
    </>
  );
}

function MenuExample({ name }: MenuExampleProps) {
  const store = Ariakit.useMenuStore();

  const focusItem = (id: string | null | undefined) => {
    if (!id) return;
    requestAnimationFrame(() => store.move(id));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const { open } = store.getState();
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(store.first());
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(store.last());
    }
  };

  return (
    <Ariakit.MenuProvider store={store}>
      <Ariakit.MenuButton onKeyDown={onKeyDown}>{name}</Ariakit.MenuButton>
      <Ariakit.Menu autoFocusOnShow={() => false} gutter={8}>
        <MenuItems />
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

export default function Example() {
  return (
    <>
      <MenuExample name="Boolean" />
      <MenuExample name="Callback" />
    </>
  );
}
