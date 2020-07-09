import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_ComboboxStateReturn } from "./ComboboxState";
import { COMBOBOX_GRID_KEYS } from "./__keys";

export type unstable_ComboboxGridOptions = BoxOptions &
  Pick<Partial<unstable_ComboboxStateReturn>, "baseId">;

export type unstable_ComboboxGridHTMLProps = BoxHTMLProps;

export type unstable_ComboboxGridProps = unstable_ComboboxGridOptions &
  unstable_ComboboxGridHTMLProps;

export const unstable_useComboboxGrid = createHook<
  unstable_ComboboxGridOptions,
  unstable_ComboboxGridHTMLProps
>({
  name: "ComboboxGrid",
  compose: useBox,
  keys: COMBOBOX_GRID_KEYS,

  useProps(options, htmlProps) {
    return { role: "grid", id: `${options.baseId}-grid`, ...htmlProps };
  },
});

export const unstable_ComboboxGrid = createComponent({
  as: "div",
  useHook: unstable_useComboboxGrid,
});
