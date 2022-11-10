import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  PopoverArrowOptions,
  usePopoverArrow,
} from "../popover/store-popover-arrow";
import { MenuStore } from "./store-menu-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow inside the menu element.
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
export const useMenuArrow = createHook<MenuArrowOptions>((props) => {
  return usePopoverArrow(props);
});

/**
 * A component that renders an arrow inside the menu element.
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

export type MenuArrowOptions<T extends As = "div"> = Omit<
  PopoverArrowOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `useMenuStore` hook. If not provided, the parent
   * `Menu` component's context will be used.
   */
  store?: MenuStore;
};

export type MenuArrowProps<T extends As = "div"> = Props<MenuArrowOptions<T>>;
