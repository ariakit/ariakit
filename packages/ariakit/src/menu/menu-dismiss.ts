import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  HovercardDismissOptions,
  useHovercardDismiss,
} from "../hovercard/hovercard-dismiss";
import { MenuState } from "./menu-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a button that hides a menu.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const state = useMenuState();
 * const props = useMenuDismiss({ state });
 * <Menu state={state}>
 *   <Role {...props} />
 * </Menu>
 * ```
 */
export const useMenuDismiss = createHook<MenuDismissOptions>((props) => {
  props = useHovercardDismiss(props);
  return props;
});

/**
 * A component that renders a button that hides a menu.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuState();
 * <Menu state={menu}>
 *   <MenuDismiss />
 * </Menu>
 * ```
 */
export const MenuDismiss = createComponent<MenuDismissOptions>((props) => {
  const htmlProps = useMenuDismiss(props);
  return createElement("button", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuDismiss.displayName = "MenuDismiss";
}

export type MenuDismissOptions<T extends As = "button"> = Omit<
  HovercardDismissOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useMenuState` hook. If not provided, the parent
   * `Menu` component's context will be used.
   */
  state?: MenuState;
};

export type MenuDismissProps<T extends As = "button"> = Props<
  MenuDismissOptions<T>
>;
