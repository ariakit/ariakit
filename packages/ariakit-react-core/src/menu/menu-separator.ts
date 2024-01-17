import type { ElementType } from "react";
import type { CompositeSeparatorOptions } from "../composite/composite-separator.js";
import { useCompositeSeparator } from "../composite/composite-separator.js";
import { createElement, createHook2, forwardRef } from "../utils/system.js";
import type { Props2 } from "../utils/types.js";
import { useMenuContext } from "./menu-context.js";
import type { MenuStore } from "./menu-store.js";

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
export const useMenuSeparator = createHook2<TagName, MenuSeparatorOptions>(
  function useMenuSeparator({ store, ...props }) {
    const context = useMenuContext();
    store = store || context;
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

export interface MenuSeparatorOptions<T extends ElementType = TagName>
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

export type MenuSeparatorProps<T extends ElementType = TagName> = Props2<
  T,
  MenuSeparatorOptions<T>
>;
