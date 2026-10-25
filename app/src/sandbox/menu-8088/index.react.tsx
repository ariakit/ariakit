import * as Ariakit from "@ariakit/react";
import { useRef, useState } from "react";

const labels = ["Formatting", "Quick format"];

export default function Example() {
  // Keeps the trigger elements, for example to focus or measure them later.
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);
  // TODO: Pass inline ref callbacks again once this is fixed:
  // https://github.com/ariakit/ariakit/issues/8088
  const [triggerRefs] = useState(() =>
    labels.map((_, index) => (element: HTMLButtonElement | null) => {
      triggers.current[index] = element;
    }),
  );
  const menu = Ariakit.useMenuStore();
  // Reading the open state re-renders the owner when the menu opens.
  const open = Ariakit.useStoreState(menu, "open");
  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      {/* Keeps the buttons far apart so the menu position shows its anchor. */}
      <div style={{ display: "flex", gap: 160 }}>
        {labels.map((label, index) => (
          <Ariakit.MenuButton key={label} store={menu} ref={triggerRefs[index]}>
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
