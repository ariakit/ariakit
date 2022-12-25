import {
  PopoverDisclosureArrowOptions,
  usePopoverDisclosureArrow,
} from "../popover/popover-disclosure-arrow";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { MenuStore } from "./menu-store";

/**
 * Returns props to create a `MenuButtonArrow` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuButtonArrow({ store });
 * <MenuButton store={store}>
 *   Edit
 *   <Role {...props} />
 * </MenuButton>
 * <Menu store={store}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export const useMenuButtonArrow = createHook<MenuButtonArrowOptions>(
  ({ store, ...props }) => {
    props = usePopoverDisclosureArrow({ store, ...props });
    return props;
  }
);

/**
 * Renders an arrow pointing to the menu position, usually inside a
 * `MenuButton`.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuStore();
 * <MenuButton store={menu}>
 *   Edit
 *   <MenuButtonArrow />
 * </MenuButton>
 * <Menu store={menu}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export const MenuButtonArrow = createComponent<MenuButtonArrowOptions>(
  (props) => {
    const htmlProps = useMenuButtonArrow(props);
    return createElement("span", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  MenuButtonArrow.displayName = "MenuButtonArrow";
}

export interface MenuButtonArrowOptions<T extends As = "span">
  extends PopoverDisclosureArrowOptions<T> {
  /**
   * Object returned by the `useMenuStore` hook. If not provided, the parent
   * `MenuButton` component's context will be used.
   */
  store?: MenuStore;
}

export type MenuButtonArrowProps<T extends As = "span"> = Props<
  MenuButtonArrowOptions<T>
>;
