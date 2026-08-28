import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const devices = ["Desktop", "Tablet", "Mobile"];

// TODO: Inline this back into the example once
// https://github.com/ariakit/ariakit/issues/4270 is fixed.
function Menu({ children, ...props }: Ariakit.MenuProps) {
  const store = Ariakit.useMenuContext();
  return (
    <Ariakit.Menu
      modal
      // Adds the menu button to the modal context so that it stays out of the
      // `inert` subtree, where Chromium refuses to read it as the menu's
      // `aria-labelledby` target.
      getPersistentElements={() => {
        const disclosureElement = store?.getState().disclosureElement;
        if (!disclosureElement) return [];
        return [disclosureElement];
      }}
      {...props}
    >
      {/* Stops Ariakit from injecting its own dismiss button, which the ARIA
          menu pattern doesn't allow inside `role="menu"`. The menu button is
          part of the modal context now, so it's the way out of the menu. */}
      <Ariakit.MenuDismiss hidden />
      {children}
    </Ariakit.Menu>
  );
}

export default function Example() {
  const [device, setDevice] = useState("Desktop");

  return (
    <div>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Preview</Ariakit.MenuButton>
        <Menu>
          {devices.map((item) => (
            <Ariakit.MenuItem key={item} onClick={() => setDevice(item)}>
              {item}
            </Ariakit.MenuItem>
          ))}
        </Menu>
      </Ariakit.MenuProvider>
      <button>Publish</button>
      <p>Previewing on {device}</p>
    </div>
  );
}
