import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import {
  StaticMenuOptions,
  StaticMenuHTMLProps,
  useStaticMenu
} from "./__Menu";
import { useMenuState } from "./MenuState";

export type MenuBarOptions = StaticMenuOptions;

export type MenuBarHTMLProps = StaticMenuHTMLProps;

export type MenuBarProps = MenuBarOptions & MenuBarHTMLProps;

export const useMenuBar = createHook<MenuBarOptions, MenuBarHTMLProps>({
  name: "MenuBar",
  compose: useStaticMenu,
  useState: useMenuState,

  useProps(_, htmlProps) {
    return { role: "menubar", ...htmlProps };
  }
});

export const MenuBar = createComponent({
  as: "div",
  useHook: useMenuBar
});
