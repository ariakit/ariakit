import type { HovercardDismissOptions } from "../hovercard/hovercard-dismiss.js";
import { useHovercardDismiss } from "../hovercard/hovercard-dismiss.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { MenuStore } from "./menu-store.js";

/**
 * Returns props to create a `MenuDismiss` component.
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
 * Renders a button that hides a menu.
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

export interface MenuDismissOptions<T extends As = "button">
  extends HovercardDismissOptions<T> {
  /**
   * Object returned by the `useMenuStore` hook. If not provided, the parent
   * `Menu` component's context will be used.
   */
  store?: MenuStore;
}

export type MenuDismissProps<T extends As = "button"> = Props<
  MenuDismissOptions<T>
>;
