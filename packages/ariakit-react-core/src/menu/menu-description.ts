import type { HovercardDescriptionOptions } from "../hovercard/hovercard-description.js";
import { useHovercardDescription } from "../hovercard/hovercard-description.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { MenuStore } from "./menu-store.js";

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
export const useMenuDescription = createHook<MenuDescriptionOptions>(
  (props) => {
    props = useHovercardDescription(props);
    return props;
  },
);

/**
 * Renders a description in a menu. This component must be wrapped with
 * [`Menu`](https://ariakit.org/reference/menu) component so the
 * `aria-describedby` prop is properly set on the menu element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * <MenuProvider>
 *   <Menu>
 *     <MenuDescription>Description</MenuDescription>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export const MenuDescription = createComponent<MenuDescriptionOptions>(
  (props) => {
    const htmlProps = useMenuDescription(props);
    return createElement("p", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  MenuDescription.displayName = "MenuDescription";
}

export interface MenuDescriptionOptions<T extends As = "p">
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

export type MenuDescriptionProps<T extends As = "p"> = Props<
  MenuDescriptionOptions<T>
>;
