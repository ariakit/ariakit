import {
  HovercardDismissOptions,
  useHovercardDismiss,
} from "../hovercard/hovercard-dismiss";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { MenuStore } from "./menu-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a button that hides a menu.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuDismiss({ store });
 * <Menu store={store}>
 *   <Role {...props} />
 * </Menu>
 * ```
 */
export const useMenuDismiss = createHook<MenuDismissOptions>((props) => {
  props = useHovercardDismiss(props);
  return props;
});

/**
 * A component that renders a button that hides a menu.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuStore();
 * <Menu store={menu}>
 *   <MenuDismiss />
 * </Menu>
 * ```
 */
export const MenuDismiss = createComponent<MenuDismissOptions>((props) => {
  const htmlProps = useMenuDismiss(props);
  return createElement("button", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuDismiss.displayName = "MenuDismiss";
}

export type MenuDismissOptions<T extends As = "button"> = Omit<
  HovercardDismissOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `useMenuStore` hook. If not provided, the parent
   * `Menu` component's context will be used.
   */
  store?: MenuStore;
};

export type MenuDismissProps<T extends As = "button"> = Props<
  MenuDismissOptions<T>
>;
