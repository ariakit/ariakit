import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { MENU_GROUP_KEYS } from "./__keys";

export type MenuGroupOptions = BoxOptions;

export type MenuGroupHTMLProps = BoxHTMLProps;

export type MenuGroupProps = MenuGroupOptions & MenuGroupHTMLProps;

export const useMenuGroup = createHook<MenuGroupOptions, MenuGroupHTMLProps>({
  name: "MenuGroup",
  compose: useBox,
  keys: MENU_GROUP_KEYS,

  useProps(_, htmlProps) {
    return { role: "group", ...htmlProps };
  },
});

export const MenuGroup = createComponent({
  as: "div",
  useHook: useMenuGroup,
});
