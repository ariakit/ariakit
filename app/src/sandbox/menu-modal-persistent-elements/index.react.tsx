import * as Ariakit from "@ariakit/react";
import type { RefObject } from "react";
import { useRef } from "react";

function Menu({
  persistentRef,
  ...props
}: Ariakit.MenuProps & { persistentRef: RefObject<HTMLElement | null> }) {
  const store = Ariakit.useMenuContext();
  return (
    <Ariakit.Menu
      modal
      getPersistentElements={() => {
        const elements: HTMLElement[] = [];
        const disclosureElement = store?.getState().disclosureElement;
        if (disclosureElement) elements.push(disclosureElement);
        if (persistentRef.current) elements.push(persistentRef.current);
        return elements;
      }}
      {...props}
    />
  );
}

export default function Example() {
  const persistentRef = useRef<HTMLButtonElement>(null);

  return (
    <Ariakit.MenuProvider>
      {/* Rendered before the menu button so that it doesn't take over the
          first Shift+Tab stop from the open menu. */}
      <button ref={persistentRef}>Refresh</button>
      <Ariakit.MenuButton>Actions</Ariakit.MenuButton>
      <Menu persistentRef={persistentRef}>
        <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
        <Ariakit.MenuItem>Share</Ariakit.MenuItem>
        <Ariakit.MenuItem disabled>Delete</Ariakit.MenuItem>
        <Ariakit.MenuSeparator />
        <Ariakit.MenuItem>Report</Ariakit.MenuItem>
      </Menu>
    </Ariakit.MenuProvider>
  );
}
