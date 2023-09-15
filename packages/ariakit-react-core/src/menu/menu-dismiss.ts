import type { HovercardDismissOptions } from "../hovercard/hovercard-dismiss.js";
import { useHovercardDismiss } from "../hovercard/hovercard-dismiss.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useMenuScopedContext } from "./menu-context.js";
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
export const useMenuDismiss = createHook<MenuDismissOptions>(
  ({ store, ...props }) => {
    const context = useMenuScopedContext();
    store = store || context;
    props = useHovercardDismiss({ store, ...props });
    return props;
  },
);

/**
 * Renders a button that hides a menu.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * <MenuProvider>
 *   <Menu>
 *     <MenuDismiss />
 *   </Menu>
 * </MenuProvider>
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
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
   * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
   * context will be used.
   */
  store?: MenuStore;
}

export type MenuDismissProps<T extends As = "button"> = Props<
  MenuDismissOptions<T>
>;
