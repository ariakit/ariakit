import {
  createHook,
  createComponent,
  createElement,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { PopoverArrowOptions, usePopoverArrow } from "../popover/popover-arrow";
import { MenuState } from "./menu-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow inside the menu element.
 * @see https://ariakit.org/docs/menu
 * @example
 * ```jsx
 * const state = useMenuState();
 * const props = useMenuArrow({ state });
 * <MenuButton state={state}>Menu</MenuButton>
 * <Menu state={state}>
 *   <Role {...props} />
 * </Menu>
 * ```
 */
export const useMenuArrow = createHook<MenuArrowOptions>((props) => {
  return usePopoverArrow(props);
});

/**
 * A component that renders an arrow inside the menu element.
 * @see https://ariakit.org/docs/menu
 * @example
 * ```jsx
 * const menu = useMenuState();
 * <MenuButton state={menu}>Menu</MenuButton>
 * <Menu state={menu}>
 *   <MenuArrow />
 * </Menu>
 * ```
 */
export const MenuArrow = createComponent<MenuArrowOptions>((props) => {
  const htmlProps = useMenuArrow(props);
  return createElement("div", htmlProps);
});

export type MenuArrowOptions<T extends As = "div"> = Omit<
  PopoverArrowOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useMenuState` hook. If not provided, the parent
   * `Menu` component's context will be used.
   */
  state?: MenuState;
};

export type MenuArrowProps<T extends As = "div"> = Props<MenuArrowOptions<T>>;
