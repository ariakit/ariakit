import type { ElementType } from "react";
import type { HovercardDescriptionOptions } from "../hovercard/hovercard-description.js";
import { useHovercardDescription } from "../hovercard/hovercard-description.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Props } from "../utils/types.js";
import type { MenuStore } from "./menu-store.js";

const TagName = "p" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `MenuDescription` component. This hook must be used
 * in a component that's wrapped with `Menu` so the `aria-describedby` prop is
 * properly set on the menu element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * // This component must be wrapped with Menu
 * const props = useMenuDescription();
 * <Role {...props}>Description</Role>
 * ```
 */
export const useMenuDescription = createHook<TagName, MenuDescriptionOptions>(
  function useMenuDescription(props) {
    props = useHovercardDescription(props);
    return props;
  },
);

/**
 * Renders a description in a menu. This component must be wrapped with a
 * [`Menu`](https://ariakit.org/reference/menu) component so the
 * `aria-describedby` prop is properly set on the menu element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {3}
 * <MenuProvider>
 *   <Menu>
 *     <MenuDescription>Description</MenuDescription>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export const MenuDescription = forwardRef(function MenuDescription(
  props: MenuDescriptionProps,
) {
  const htmlProps = useMenuDescription(props);
  return createElement(TagName, htmlProps);
});

export interface MenuDescriptionOptions<T extends ElementType = TagName>
  extends HovercardDescriptionOptions<T> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
   * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
   * context will be used.
   */
  store?: MenuStore;
}

export type MenuDescriptionProps<T extends ElementType = TagName> = Props<
  T,
  MenuDescriptionOptions<T>
>;
