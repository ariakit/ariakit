import { MenuStoreState } from "./menu-store";

export function hasExpandedMenuButton(
  items?: MenuStoreState["items"],
  currentElement?: Element
) {
  return !!items
    ?.filter((item) => item.element !== currentElement)
    .some((item) => item.element?.getAttribute("aria-expanded") === "true");
}
