import * as Ariakit from "@ariakit/react";
import { useRef, useState } from "react";

function SingleMenu() {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  return (
    <Ariakit.MenuProvider showTimeout={0} hideTimeout={300}>
      <Ariakit.MenuButton
        showOnHover
        // An inline ref callback has a new identity on every render, so each
        // pointer move detaches and re-attaches the menu button.
        ref={(element: HTMLButtonElement | null) => {
          buttonRef.current = element;
        }}
      >
        Actions
      </Ariakit.MenuButton>
      <Ariakit.Menu hideOnHoverOutside>
        <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
        <Ariakit.MenuItem>Share</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

// Both menu buttons share one menu, and each pointer move re-attaches both
// inline refs while the menu is open.
function SharedMenu() {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menu = Ariakit.useMenuStore({ showTimeout: 0, hideTimeout: 300 });
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {["Format", "Arrange"].map((label, index) => (
        <Ariakit.MenuButton
          key={label}
          store={menu}
          showOnHover
          ref={(element: HTMLButtonElement | null) => {
            buttonRefs.current[index] = element;
          }}
        >
          {label}
        </Ariakit.MenuButton>
      ))}
      <Ariakit.Menu store={menu} hideOnHoverOutside>
        <Ariakit.MenuItem>Align</Ariakit.MenuItem>
        <Ariakit.MenuItem>Group</Ariakit.MenuItem>
      </Ariakit.Menu>
    </div>
  );
}

export default function Example() {
  const [pointer, setPointer] = useState("none");
  return (
    <div
      style={{ display: "flex", gap: 160, alignItems: "start", padding: 16 }}
      onMouseMove={(event) => setPointer(`${event.clientX}, ${event.clientY}`)}
    >
      <SingleMenu />
      <SharedMenu />
      <p>Pointer: {pointer}</p>
    </div>
  );
}
