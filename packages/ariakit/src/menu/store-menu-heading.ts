import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  HovercardHeadingOptions,
  useHovercardHeading,
} from "../hovercard/store-hovercard-heading";
import { MenuStore } from "./store-menu-store";

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
 * const menu = useMenuStore();
 * <Menu store={menu}>
 *   <MenuHeading>Heading</MenuHeading>
 * </Menu>
 * ```
 */
export const MenuHeading = createComponent<MenuHeadingOptions>((props) => {
  const htmlProps = useMenuHeading(props);
  return createElement("h1", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuHeading.displayName = "MenuHeading";
}

export type MenuHeadingOptions<T extends As = "h1"> = Omit<
  HovercardHeadingOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `useMenuStore` hook. If not provided, the parent
   * `Menu` component's context will be used.
   */
  store?: MenuStore;
};

export type MenuHeadingProps<T extends As = "h1"> = Props<
  MenuHeadingOptions<T>
>;
