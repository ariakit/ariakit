"use client";
import type { CompositeSeparatorOptions } from "../composite/composite-separator.js";
import { useCompositeSeparator } from "../composite/composite-separator.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useMenuContext } from "./menu-context.js";
import type { MenuStore } from "./menu-store.js";

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
export const useMenuSeparator = createHook<MenuSeparatorOptions>(
  ({ store, ...props }) => {
    const context = useMenuContext();
    store = store || context;
    props = useCompositeSeparator({ store, ...props });
    return props;
  },
);

/**
 * Renders a separator for menu items.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * <MenuProvider>
 *   <MenuButton>Edit</MenuButton>
 *   <Menu>
 *     <MenuItem>Undo</MenuItem>
 *     <MenuItem>Redo</MenuItem>
 *     <MenuSeparator />
 *     <MenuItem>Cut</MenuItem>
 *   </Menu>
 * </MenuProvider>
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
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
   * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
   * context will be used.
   */
  store?: MenuStore;
}

export type MenuSeparatorProps<T extends As = "hr"> = Props<
  MenuSeparatorOptions<T>
>;
