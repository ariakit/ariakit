import type { CompositeGroupLabelOptions } from "../composite/composite-group-label.js";
import { useCompositeGroupLabel } from "../composite/composite-group-label.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { MenuStore } from "./menu-store.js";

/**
 * Returns props to create a `MenuGroupLabel` component. This hook must be used
 * in a component that's wrapped with `MenuGroup` so the `aria-labelledby` prop
 * is properly set on the menu group element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * // This component must be wrapped with MenuGroup
 * const props = useMenuGroupLabel();
 * <Role {...props}>Label</Role>
 * ```
 */
export const useMenuGroupLabel = createHook2<TagName, MenuGroupLabelOptions>(
  (props) => {
    props = useCompositeGroupLabel(props);
    return props;
  },
);

/**
 * Renders a label in a menu group. This component should be wrapped with
 * [`MenuGroup`](https://ariakit.org/reference/menu-group) so the
 * `aria-labelledby` is correctly set on the group element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {5}
 * <MenuProvider>
 *   <MenuButton>Recent Items</MenuButton>
 *   <Menu>
 *     <MenuGroup>
 *       <MenuGroupLabel>Applications</MenuGroupLabel>
 *       <MenuItem>Google Chrome.app</MenuItem>
 *       <MenuItem>Safari.app</MenuItem>
 *     </MenuGroup>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export const MenuGroupLabel = forwardRef(function MenuGroupLabel(
  props: MenuGroupLabelProps,
) {
  const htmlProps = useMenuGroupLabel(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuGroupLabel.displayName = "MenuGroupLabel";
}

export interface MenuGroupLabelOptions<T extends As = "div">
  extends CompositeGroupLabelOptions<T> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
   * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
   * context will be used.
   */
  store?: MenuStore;
}

export type MenuGroupLabelProps<T extends As = "div"> = Props<
  MenuGroupLabelOptions<T>
>;
