import * as Ariakit from "@ariakit/react";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { useState } from "react";

interface MenuItemRadioProbeProps extends ComponentPropsWithoutRef<"div"> {
  defaultChecked?: boolean;
}

const MenuItemRadioProbe = forwardRef<HTMLDivElement, MenuItemRadioProbeProps>(
  function MenuItemRadioProbe({ defaultChecked, ...props }, ref) {
    const leakProps =
      defaultChecked === undefined
        ? undefined
        : { "data-default-checked-prop": `${defaultChecked}` };

    return <div ref={ref} {...props} {...leakProps} />;
  },
);

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
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Preferences</Ariakit.MenuButton>
        <Ariakit.Menu alwaysVisible>
          <Ariakit.MenuItemRadio
            render={<MenuItemRadioProbe />}
            name="density"
            value="compact"
            defaultChecked
          >
            Compact
          </Ariakit.MenuItemRadio>
          <Ariakit.MenuItemRadio name="density" value="comfortable">
            Comfortable
          </Ariakit.MenuItemRadio>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
    </>
  );
}
