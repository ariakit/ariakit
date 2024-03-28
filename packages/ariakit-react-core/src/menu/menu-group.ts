import type { ElementType } from "react";
import type { CompositeGroupOptions } from "../composite/composite-group.ts";
import { useCompositeGroup } from "../composite/composite-group.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import type { MenuStore } from "./menu-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `MenuGroup` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuGroup({ store });
 * <MenuButton store={store}>Recent Items</MenuButton>
 * <Menu store={store}>
 *   <Role {...props}>
 *     <MenuGroupLabel>Applications</MenuGroupLabel>
 *     <MenuItem>Google Chrome.app</MenuItem>
 *     <MenuItem>Safari.app</MenuItem>
 *   </Role>
 * </Menu>
 * ```
 */
export const useMenuGroup = createHook<TagName, MenuGroupOptions>(
  function useMenuGroup(props) {
    props = useCompositeGroup(props);
    return props;
  },
);

/**
 * Renders a group for [`MenuItem`](https://ariakit.org/reference/menu-item)
 * elements. Optionally, a
 * [`MenuGroupLabel`](https://ariakit.org/reference/menu-group-label) can be
 * rendered as a child to provide a label for the group.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {4-8}
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
export const MenuGroup = forwardRef(function MenuGroup(props: MenuGroupProps) {
  const htmlProps = useMenuGroup(props);
  return createElement(TagName, htmlProps);
});

export interface MenuGroupOptions<T extends ElementType = TagName>
  extends CompositeGroupOptions<T> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
   * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
   * context will be used.
   */
  store?: MenuStore;
}

export type MenuGroupProps<T extends ElementType = TagName> = Props<
  T,
  MenuGroupOptions<T>
>;
