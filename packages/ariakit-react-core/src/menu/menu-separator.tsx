import type { ElementType } from "react";
import type { CompositeSeparatorOptions } from "../composite/composite-separator.tsx";
import { useCompositeSeparator } from "../composite/composite-separator.tsx";
import type { StoreProp } from "../utils/system.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useMenuContextStore } from "./menu-context.tsx";
import type { MenuStore } from "./menu-store.ts";

const TagName = "hr" satisfies ElementType;
type TagName = typeof TagName;

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
export const useMenuSeparator = createHook<TagName, MenuSeparatorOptions>(
  function useMenuSeparator({ store, ...props }) {
    store = useMenuContextStore(store, "MenuSeparator");
    props = useCompositeSeparator({ store, ...props });
    return props;
  },
);

/**
 * Renders a divider between
 * [`MenuItem`](https://ariakit.org/reference/menu-item),
 * [`MenuItemCheckbox`](https://ariakit.org/reference/menu-item-checkbox), and
 * [`MenuItemRadio`](https://ariakit.org/reference/menu-item-radio) elements.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {6}
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
export const MenuSeparator = forwardRef(function MenuSeparator(
  props: MenuSeparatorProps,
) {
  const htmlProps = useMenuSeparator(props);
  return createElement(TagName, htmlProps);
});

export interface MenuSeparatorOptions<
  T extends ElementType = TagName,
> extends CompositeSeparatorOptions<T> {
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

export type MenuSeparatorProps<T extends ElementType = TagName> = Props<
  T,
  MenuSeparatorOptions<T>
>;
