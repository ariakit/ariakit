import { createContext } from "react";
import { MenuBarStore } from "./store-menu-bar-store";
import { MenuStore, MenuStoreState } from "./store-menu-store";

export const MenuBarContext = createContext<MenuBarStore | undefined>(
  undefined
);
export const MenuContext = createContext<MenuStore | undefined>(undefined);
export const MenuItemCheckedContext = createContext<boolean | undefined>(
  undefined
);

export function hasExpandedMenuButton(
  items?: MenuStoreState["items"],
  currentElement?: Element
) {
  return !!items
    ?.filter((item) => item.element !== currentElement)
    .some((item) => item.element?.getAttribute("aria-expanded") === "true");
}
