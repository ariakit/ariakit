import { createComponent } from "reakit-utils/createComponent";
import { createHook } from "reakit-utils/createHook";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { useMenuState } from "./MenuState";

export type MenuGroupOptions = BoxOptions;

export type MenuGroupHTMLProps = BoxHTMLProps;

export type MenuGroupProps = MenuGroupOptions & MenuGroupHTMLProps;

export const useMenuGroup = createHook<MenuGroupOptions, MenuGroupHTMLProps>({
  name: "MenuGroup",
  compose: useBox,
  useState: useMenuState,

  useProps(_, htmlProps) {
    return { role: "group", ...htmlProps };
  }
});

export const MenuGroup = createComponent({
  as: "div",
  useHook: useMenuGroup
});
