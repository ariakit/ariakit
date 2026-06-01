import * as Ariakit from "@ariakit/react";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

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

export default function Example() {
  return (
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
  );
}
