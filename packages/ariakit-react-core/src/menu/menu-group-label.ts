import type { CompositeGroupLabelOptions } from "../composite/composite-group-label.js";
import { useCompositeGroupLabel } from "../composite/composite-group-label.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
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
export const useMenuGroupLabel = createHook<MenuGroupLabelOptions>((props) => {
  props = useCompositeGroupLabel(props);
  return props;
});

/**
 * Renders a label in a menu group. This component must be wrapped with
 * `MenuGroup` so the `aria-labelledby` prop is properly set on the menu group
 * element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuStore();
 * <MenuButton store={menu}>Recent Items</MenuButton>
 * <Menu store={menu}>
 *   <MenuGroup>
 *     <MenuGroupLabel>Applications</MenuGroupLabel>
 *     <MenuItem>Google Chrome.app</MenuItem>
 *     <MenuItem>Safari.app</MenuItem>
 *   </MenuGroup>
 * </Menu>
 * ```
 */
export const MenuGroupLabel = createComponent<MenuGroupLabelOptions>(
  (props) => {
    const htmlProps = useMenuGroupLabel(props);
    return createElement("div", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  MenuGroupLabel.displayName = "MenuGroupLabel";
}

export interface MenuGroupLabelOptions<T extends As = "div">
  extends CompositeGroupLabelOptions<T> {
  /**
   * Object returned by the `useMenuStore` hook.
   */
  store?: MenuStore;
}

export type MenuGroupLabelProps<T extends As = "div"> = Props<
  MenuGroupLabelOptions<T>
>;
