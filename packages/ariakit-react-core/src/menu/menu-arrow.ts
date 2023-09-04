import type { PopoverArrowOptions } from "../popover/popover-arrow.js";
import { usePopoverArrow } from "../popover/popover-arrow.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useMenuContext } from "./menu-context.js";
import type { MenuStore } from "./menu-store.js";

/**
 * Returns props to create a `MenuArrow` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuArrow({ store });
 * <MenuButton store={store}>Menu</MenuButton>
 * <Menu store={store}>
 *   <Role {...props} />
 * </Menu>
 * ```
 */
export const useMenuArrow = createHook<MenuArrowOptions>(
  ({ store, ...props }) => {
    const context = useMenuContext();
    store = store || context;
    return usePopoverArrow({ store, ...props });
  },
);

/**
 * Renders an arrow inside the menu element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuStore();
 * <MenuButton store={menu}>Menu</MenuButton>
 * <Menu store={menu}>
 *   <MenuArrow />
 * </Menu>
 * ```
 */
export const MenuArrow = createComponent<MenuArrowOptions>((props) => {
  const htmlProps = useMenuArrow(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuArrow.displayName = "MenuArrow";
}

export interface MenuArrowOptions<T extends As = "div">
  extends PopoverArrowOptions<T> {
  /**
   * Object returned by the `useMenuStore` hook. If not provided, the parent
   * `Menu` component's context will be used.
   */
  store?: MenuStore;
}

export type MenuArrowProps<T extends As = "div"> = Props<MenuArrowOptions<T>>;
