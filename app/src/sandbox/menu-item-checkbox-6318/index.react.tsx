import * as Ariakit from "@ariakit/react";
import { useState } from "react";

// Reproduces https://github.com/ariakit/ariakit/issues/6318
export default function Example() {
  const menu = Ariakit.useMenuStore();
  const values = Ariakit.useStoreState(menu, "values");
  const [minimap, setMinimap] = useState(true);

  return (
    <>
      <Ariakit.MenuButton store={menu}>View</Ariakit.MenuButton>
      <Ariakit.Menu store={menu}>
        <Ariakit.MenuItemCheckbox name="showSidebar" defaultChecked>
          <Ariakit.MenuItemCheck />
          Show sidebar
        </Ariakit.MenuItemCheckbox>
        <Ariakit.MenuItemCheckbox
          name="minimap"
          checked={minimap}
          onChange={() => setMinimap((value) => !value)}
        >
          <Ariakit.MenuItemCheck />
          Minimap
        </Ariakit.MenuItemCheckbox>
      </Ariakit.Menu>
      <output aria-label="Menu values">{JSON.stringify(values)}</output>
    </>
  );
}
