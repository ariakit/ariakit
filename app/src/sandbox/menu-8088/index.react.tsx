import * as Ariakit from "@ariakit/react";
import { useRef } from "react";

const labels = ["Formatting", "Quick format"];

export default function Example() {
  // Keeps the trigger elements, for example to focus or measure them later.
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);
  const menu = Ariakit.useMenuStore();
  // Reading the open state re-renders the owner when the menu opens, which
  // gives each trigger a new inline ref callback.
  const open = Ariakit.useStoreState(menu, "open");
  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      {/* Keeps the buttons far apart so the menu position shows its anchor. */}
      <div style={{ display: "flex", gap: 160 }}>
        {labels.map((label, index) => (
          <Ariakit.MenuButton
            key={label}
            store={menu}
            ref={(element: HTMLButtonElement | null) => {
              triggers.current[index] = element;
            }}
          >
            {label}
          </Ariakit.MenuButton>
        ))}
      </div>
      <Ariakit.Menu store={menu} gutter={8}>
        <Ariakit.MenuItem>Bold</Ariakit.MenuItem>
        <Ariakit.MenuItem>Italic</Ariakit.MenuItem>
      </Ariakit.Menu>
      <p>Menu: {open ? "open" : "closed"}</p>
    </div>
  );
}
