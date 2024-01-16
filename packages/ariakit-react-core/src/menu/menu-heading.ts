import type { HovercardHeadingOptions } from "../hovercard/hovercard-heading.js";
import { useHovercardHeading } from "../hovercard/hovercard-heading.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { MenuStore } from "./menu-store.js";

/**
 * Returns props to create a `MenuHeading` component. This hook must be used in
 * a component that's wrapped with `Menu` so the `aria-labelledby` prop is
 * properly set on the menu element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * // This component must be wrapped with Menu
 * const props = useMenuHeading();
 * <Role {...props}>Heading</Role>
 * ```
 */
export const useMenuHeading = createHook2<TagName, MenuHeadingOptions>(
  (props) => {
    props = useHovercardHeading(props);
    return props;
  },
);

/**
 * Renders a heading in a menu. This component must be wrapped within
 * [`Menu`](https://ariakit.org/reference/menu) so the `aria-labelledby` prop is
 * properly set on the content element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * <MenuProvider>
 *   <Menu>
 *     <MenuHeading>Heading</MenuHeading>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export const MenuHeading = forwardRef(function MenuHeading(
  props: MenuHeadingProps,
) {
  const htmlProps = useMenuHeading(props);
  return createElement("h1", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuHeading.displayName = "MenuHeading";
}

export interface MenuHeadingOptions<T extends As = "h1">
  extends HovercardHeadingOptions<T> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
   * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
   * context will be used.
   */
  store?: MenuStore;
}

export type MenuHeadingProps<T extends As = "h1"> = Props<
  MenuHeadingOptions<T>
>;
