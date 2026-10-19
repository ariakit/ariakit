"use client";

import * as Ariakit from "@ariakit/react";

const popupStyle = {
  background: "white",
  border: "1px solid gray",
  padding: 8,
};

// The React Compiler is enabled in this app, and it also compiles the Ariakit
// source that the workspace packages resolve to.
export default function Page() {
  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton>Actions</Ariakit.MenuButton>
      <Ariakit.Menu style={popupStyle}>
        <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
        <Ariakit.MenuItem>Share</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}
