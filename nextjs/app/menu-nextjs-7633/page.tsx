"use client";

import * as Ariakit from "@ariakit/react";
import { Suspense } from "react";
import type { MouseEvent } from "react";

const popupStyle = {
  background: "white",
  border: "1px solid gray",
  padding: 8,
};

function ActionsMenu() {
  const menu = Ariakit.useMenuStore();
  return (
    <Ariakit.MenuProvider store={menu}>
      <Ariakit.MenuButton
        onClick={(event: MouseEvent<HTMLElement>) => {
          // TODO: Remove this workaround when the fix for
          // https://github.com/ariakit/ariakit/issues/7633 is released.
          const { open } = menu.getState();
          const button = event.currentTarget;
          queueMicrotask(() => {
            // Ariakit toggled the menu, so the click already works.
            if (menu.getState().open !== open) return;
            menu.setDisclosureElement(button);
            menu.toggle();
          });
        }}
      >
        Actions
      </Ariakit.MenuButton>
      <Ariakit.Menu style={popupStyle}>
        <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
        <Ariakit.MenuItem>Share</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

// The React Compiler is enabled in this app, and it also compiles the Ariakit
// source that the workspace packages resolve to.
export default function Page() {
  return (
    // The menu store generates a random id, which Cache Components rejects
    // during prerender outside a Suspense boundary.
    <Suspense fallback={null}>
      <ActionsMenu />
    </Suspense>
  );
}
