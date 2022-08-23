import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CompositeGroupOptions,
  useCompositeGroup,
} from "../composite/composite-group";
import { MenuState } from "./menu-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a menu group.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const state = useMenuState();
 * const props = useMenuGroup({ state });
 * <MenuButton state={state}>Recent Items</MenuButton>
 * <Menu state={state}>
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
 * const menu = useMenuState();
 * <MenuButton state={menu}>Recent Items</MenuButton>
 * <Menu state={menu}>
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
  "state"
> & {
  /**
   * Object returned by the `useMenuState` hook.
   */
  state?: MenuState;
};

export type MenuGroupProps<T extends As = "div"> = Props<MenuGroupOptions<T>>;
