import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  HovercardHeadingOptions,
  useHovercardHeading,
} from "../hovercard/hovercard-heading";
import { MenuState } from "./menu-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a heading element for a menu. This hook must be
 * used in a component that's wrapped with `Menu` so the `aria-labelledby` prop
 * is properly set on the menu element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * // This component must be wrapped with Menu
 * const props = useMenuHeading();
 * <Role {...props}>Heading</Role>
 * ```
 */
export const useMenuHeading = createHook<MenuHeadingOptions>((props) => {
  props = useHovercardHeading(props);
  return props;
});

/**
 * A component that renders a heading in a menu. This component must be wrapped
 * with `Menu` so the `aria-labelledby` prop is properly set on the menu
 * element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuState();
 * <Menu state={menu}>
 *   <MenuHeading>Heading</MenuHeading>
 * </Menu>
 * ```
 */
export const MenuHeading = createComponent<MenuHeadingOptions>((props) => {
  const htmlProps = useMenuHeading(props);
  return createElement("h1", htmlProps);
});

export type MenuHeadingOptions<T extends As = "h1"> = Omit<
  HovercardHeadingOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useMenuState` hook. If not provided, the parent
   * `Menu` component's context will be used.
   */
  state?: MenuState;
};

export type MenuHeadingProps<T extends As = "h1"> = Props<
  MenuHeadingOptions<T>
>;
