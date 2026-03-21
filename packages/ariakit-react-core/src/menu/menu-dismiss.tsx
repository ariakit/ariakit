import type { ElementType } from "react";
import type { HovercardDismissOptions } from "../hovercard/hovercard-dismiss.tsx";
import { useHovercardDismiss } from "../hovercard/hovercard-dismiss.tsx";
import type { StoreProp } from "../utils/system.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useMenuScopedContextStore } from "./menu-context.tsx";
import type { MenuStore } from "./menu-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;

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
export const useMenuDismiss = createHook<TagName, MenuDismissOptions>(
  function useMenuDismiss({ store, ...props }) {
    store = useMenuScopedContextStore(store, "MenuDismiss");
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

export interface MenuDismissOptions<
  T extends ElementType = TagName,
> extends HovercardDismissOptions<T> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook.
   * This prop can also receive the corresponding
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider) component,
   * which makes the component read the store from that provider's context
   * explicitly, or `null`, which disables context lookup.
   * If not provided, the closest
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider)
   * component's context will be used.
   */
  store?: StoreProp<MenuStore>;
}

export type MenuDismissProps<T extends ElementType = TagName> = Props<
  T,
  MenuDismissOptions<T>
>;
