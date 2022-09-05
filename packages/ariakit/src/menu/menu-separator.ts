import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  CompositeSeparatorOptions,
  useCompositeSeparator,
} from "../composite/composite-separator";
import { MenuState } from "./menu-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a separator for menu items.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const state = useMenuState();
 * const props = useMenuSeparator({ state });
 * <MenuButton state={state}>Edit</MenuButton>
 * <Menu state={state}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 *   <Role {...props} />
 *   <MenuItem>Cut</MenuItem>
 * </Menu>
 * ```
 */
export const useMenuSeparator = createHook<MenuSeparatorOptions>((props) => {
  props = useCompositeSeparator(props);
  return props;
});

/**
 * A component that renders a separator for menu items.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuState();
 * <MenuButton state={menu}>Edit</MenuButton>
 * <Menu state={menu}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 *   <MenuSeparator />
 *   <MenuItem>Cut</MenuItem>
 * </Menu>
 * ```
 */
export const MenuSeparator = createComponent<MenuSeparatorOptions>((props) => {
  const htmlProps = useMenuSeparator(props);
  return createElement("hr", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuSeparator.displayName = "MenuSeparator";
}

export type MenuSeparatorOptions<T extends As = "hr"> = Omit<
  CompositeSeparatorOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useMenuState` hook. If not provided, the parent
   * `Menu` component's context will be used.
   */
  state?: MenuState;
};

export type MenuSeparatorProps<T extends As = "hr"> = Props<
  MenuSeparatorOptions<T>
>;
