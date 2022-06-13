import { createContext } from "react";
import { createStoreContext } from "ariakit-utils/store";
import { MenuBarState } from "./menu-bar-state";
import { MenuState } from "./menu-state";

export const MenuBarContext = createStoreContext<MenuBarState>();
export const MenuContext = createStoreContext<MenuState>();
export const MenuItemCheckedContext = createContext<boolean | undefined>(
  undefined
);

export function hasExpandedMenuButton(
  items?: MenuState["renderedItems"],
  currentElement?: Element
) {
  return !!items
    ?.filter((item) => item.ref?.current && item.ref.current !== currentElement)
    .some(
      (item) => item.ref?.current?.getAttribute("aria-expanded") === "true"
    );
}
