import type { HovercardDismissOptions } from "../hovercard/hovercard-dismiss.js";
import { useHovercardDismiss } from "../hovercard/hovercard-dismiss.js";
import { createElement, createHook2 } from "../utils/system.js";
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
export const useMenuDismiss = createHook2<TagName, MenuDismissOptions>(
  ({ store, ...props }) => {
    const context = useMenuScopedContext();
    store = store || context;
    props = useHovercardDismiss({ store, ...props });
    return props;
  },
);

/**
 * Renders a button that hides a [`Menu`](https://ariakit.org/reference/menu)
 * when clicked.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {3}
 * <MenuProvider>
 *   <Menu>
 *     <MenuDismiss />
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export const MenuDismiss = forwardRef(function MenuDismiss(
  props: MenuDismissProps,
) {
  const htmlProps = useMenuDismiss(props);
  return createElement(TagName, htmlProps);
});

export interface MenuDismissOptions<T extends ElementType = TagName>
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

export type MenuDismissProps<T extends ElementType = TagName> = Props<
  MenuDismissOptions<T>
>;
