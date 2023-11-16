import type { MenuStoreState } from "./menu-store.js";

export function hasExpandedMenuButton(
  items?: MenuStoreState["items"],
  currentElement?: Element,
) {
  return !!items?.some((item) => {
    if (item.element === currentElement) return false;
    return item.element?.getAttribute("aria-expanded") === "true";
  });
}
