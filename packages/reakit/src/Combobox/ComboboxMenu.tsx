import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { getMenuId } from "./__utils/getMenuId";
import { unstable_ComboboxStateReturn } from "./ComboboxState";
import { COMBOBOX_MENU_KEYS } from "./__keys";

export const unstable_useComboboxMenu = createHook<
  unstable_ComboboxMenuOptions,
  unstable_ComboboxMenuHTMLProps
>({
  name: "ComboboxMenu",
  compose: useBox,
  keys: COMBOBOX_MENU_KEYS,

  useOptions({ menuRole = "listbox", ...options }) {
    return { menuRole, ...options };
  },

  useProps(options, htmlProps) {
    return {
      role: options.menuRole,
      id: getMenuId(options.baseId),
      ...htmlProps,
    };
  },
});

// TODO: Should have aria label
export const unstable_ComboboxMenu = createComponent({
  as: "div",
  useHook: unstable_useComboboxMenu,
});

export type unstable_ComboboxMenuOptions = BoxOptions &
  Pick<Partial<unstable_ComboboxStateReturn>, "menuRole"> &
  Pick<unstable_ComboboxStateReturn, "baseId">;

export type unstable_ComboboxMenuHTMLProps = BoxHTMLProps;

export type unstable_ComboboxMenuProps = unstable_ComboboxMenuOptions &
  unstable_ComboboxMenuHTMLProps;
