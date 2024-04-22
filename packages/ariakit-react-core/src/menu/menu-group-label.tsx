import type { ElementType } from "react";
import type { CompositeGroupLabelOptions } from "../composite/composite-group-label.tsx";
import { useCompositeGroupLabel } from "../composite/composite-group-label.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import type { MenuStore } from "./menu-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

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
export const useMenuGroupLabel = createHook<TagName, MenuGroupLabelOptions>(
  function useMenuGroupLabel(props) {
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
  return createElement(TagName, htmlProps);
});

export interface MenuGroupLabelOptions<T extends ElementType = TagName>
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

export type MenuGroupLabelProps<T extends ElementType = TagName> = Props<
  T,
  MenuGroupLabelOptions<T>
>;
