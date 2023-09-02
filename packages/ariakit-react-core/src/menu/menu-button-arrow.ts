import type { PopoverDisclosureArrowOptions } from "../popover/popover-disclosure-arrow.js";
import { usePopoverDisclosureArrow } from "../popover/popover-disclosure-arrow.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useMenuContext } from "./menu-context.js";
import type { MenuStore } from "./menu-store.js";

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
    const context = useMenuContext();
    store = store || context;
    props = usePopoverDisclosureArrow({ store, ...props });
    return props;
  },
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
  },
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
