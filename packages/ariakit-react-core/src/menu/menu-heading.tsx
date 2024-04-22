import type { ElementType } from "react";
import type { HovercardHeadingOptions } from "../hovercard/hovercard-heading.tsx";
import { useHovercardHeading } from "../hovercard/hovercard-heading.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import type { MenuStore } from "./menu-store.ts";

const TagName = "h1" satisfies ElementType;
type TagName = typeof TagName;

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
export const useMenuHeading = createHook<TagName, MenuHeadingOptions>(
  function useMenuHeading(props) {
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
  return createElement(TagName, htmlProps);
});

export interface MenuHeadingOptions<T extends ElementType = TagName>
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

export type MenuHeadingProps<T extends ElementType = TagName> = Props<
  T,
  MenuHeadingOptions<T>
>;
