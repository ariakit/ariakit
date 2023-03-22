import {
  CompositeSeparatorOptions,
  useCompositeSeparator,
} from "../composite/composite-separator.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import { As, Props } from "../utils/types.js";
import { MenuStore } from "./menu-store.js";

/**
 * Returns props to create a `MenuSeparator` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuSeparator({ store });
 * <MenuButton store={store}>Edit</MenuButton>
 * <Menu store={store}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 *   <Role {...props} />
 *   <MenuItem>Cut</MenuItem>
 * </Menu>
 * ```
 */
export const useMenuSeparator = createHook<MenuSeparatorOptions>((props) => {
  props = useCompositeSeparator(props);
  return props;
});

/**
 * Renders a separator for menu items.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuStore();
 * <MenuButton store={menu}>Edit</MenuButton>
 * <Menu store={menu}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 *   <MenuSeparator />
 *   <MenuItem>Cut</MenuItem>
 * </Menu>
 * ```
 */
export const MenuSeparator = createComponent<MenuSeparatorOptions>((props) => {
  const htmlProps = useMenuSeparator(props);
  return createElement("hr", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuSeparator.displayName = "MenuSeparator";
}

export interface MenuSeparatorOptions<T extends As = "hr">
  extends CompositeSeparatorOptions<T> {
  /**
   * Object returned by the `useMenuStore` hook. If not provided, the parent
   * `Menu` component's context will be used.
   */
  store?: MenuStore;
}

export type MenuSeparatorProps<T extends As = "hr"> = Props<
  MenuSeparatorOptions<T>
>;
