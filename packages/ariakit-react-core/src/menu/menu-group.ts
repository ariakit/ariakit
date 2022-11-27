import {
  CompositeGroupOptions,
  useCompositeGroup,
} from "../composite/composite-group";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { MenuStore } from "./menu-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a menu group.
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
export const useMenuGroup = createHook<MenuGroupOptions>((props) => {
  props = useCompositeGroup(props);
  return props;
});

/**
 * A component that renders a menu group.
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
export const MenuGroup = createComponent<MenuGroupOptions>((props) => {
  const htmlProps = useMenuGroup(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuGroup.displayName = "MenuGroup";
}

export type MenuGroupOptions<T extends As = "div"> = Omit<
  CompositeGroupOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `useMenuStore` hook.
   */
  store?: MenuStore;
};

export type MenuGroupProps<T extends As = "div"> = Props<MenuGroupOptions<T>>;
