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

function MenuItems({ otherRef }: { otherRef: RefObject<HTMLElement | null> }) {
  const store = Ariakit.useMenuContext();
  return (
    <>
      <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
      <Ariakit.MenuItem>Share</Ariakit.MenuItem>
      <Ariakit.MenuItem disabled>Delete</Ariakit.MenuItem>
      <Ariakit.MenuSeparator />
      <Ariakit.MenuItem>Report</Ariakit.MenuItem>
      {/* Hands the menu over to another trigger while it stays open, the way
          an app that swaps its own trigger would. */}
      <Ariakit.MenuItem
        hideOnClick={false}
        onClick={() => {
          if (!otherRef.current) return;
          store?.setDisclosureElement(otherRef.current);
        }}
      >
        Use other trigger
      </Ariakit.MenuItem>
    </>
  );
}

export default function Example() {
  const persistentRef = useRef<HTMLButtonElement>(null);
  const otherRef = useRef<HTMLButtonElement>(null);

  return (
    <Ariakit.MenuProvider>
      {/* Rendered before the menu button so that they don't take over the
          first Shift+Tab stop from the open menu. Safari leaves a plain button
          out of the tab order without an explicit tab index, and these have no
          Ariakit component to supply it. */}
      {/* The menu names itself after its disclosure through `aria-labelledby`,
          which only resolves when the disclosure carries an id of its own. */}
      <button ref={otherRef} id="other-trigger" tabIndex={0}>
        Other
      </button>
      <button ref={persistentRef} tabIndex={0}>
        Refresh
      </button>
      <Ariakit.MenuButton>Actions</Ariakit.MenuButton>
      <Menu persistentRef={persistentRef}>
        <MenuItems otherRef={otherRef} />
      </Menu>
    </Ariakit.MenuProvider>
  );
}
