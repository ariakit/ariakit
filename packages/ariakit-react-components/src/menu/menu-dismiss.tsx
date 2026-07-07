import {
  createElement,
  createHook,
  forwardRef,
  useStoreProp,
} from "@ariakit/react-utils";
import type { Props, ProviderComponent } from "@ariakit/react-utils";
import type { ElementType } from "react";
import type { HovercardDismissOptions } from "../hovercard/hovercard-dismiss.tsx";
import { useHovercardDismiss } from "../hovercard/hovercard-dismiss.tsx";
import { useMenuScopedContext } from "./menu-context.tsx";
import type { MenuStore } from "./menu-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `MenuDismiss` component.
 * @see https://ariakit.com/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuDismiss({ store });
 * <Menu store={store}>
 *   <Role {...props} />
 * </Menu>
 * ```
 */
export const useMenuDismiss = createHook<TagName, MenuDismissOptions>(
  function useMenuDismiss({ store, ...props }) {
    const context = useMenuScopedContext();
    store = useStoreProp(store, context);
    props = useHovercardDismiss({ store, ...props });
    return props;
  },
);

/**
 * Renders a button that hides a [`Menu`](https://ariakit.com/reference/menu)
 * when clicked.
 * @see https://ariakit.com/components/menu
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

export interface MenuDismissOptions<
  T extends ElementType = TagName,
> extends HovercardDismissOptions<T> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.com/reference/use-menu-store) hook. If not
   * provided, the closest [`Menu`](https://ariakit.com/reference/menu) or
   * [`MenuProvider`](https://ariakit.com/reference/menu-provider) components'
   * context will be used.
   *
   * You can also pass a provider component (for example,
   * [`MenuProvider`](https://ariakit.com/reference/menu-provider)). In that case,
   * the store is read from the closest matching provider, even if another
   * compatible store context is closer.
   */
  store?: MenuStore | ProviderComponent<MenuStore>;
}

export type MenuDismissProps<T extends ElementType = TagName> = Props<
  T,
  MenuDismissOptions<T>
>;
