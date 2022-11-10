import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  HovercardDescriptionOptions,
  useHovercardDescription,
} from "../hovercard/store-hovercard-description";
import { MenuStore } from "./store-menu-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a description element for a menu. This hook must
 * be used in a component that's wrapped with `Menu` so the `aria-describedby`
 * prop is properly set on the menu element.
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
  }
);

/**
 * A component that renders a description in a menu. This component must be
 * wrapped with `Menu` so the `aria-describedby` prop is properly set on the
 * menu element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuStore();
 * <Menu store={menu}>
 *   <MenuDescription>Description</MenuDescription>
 * </Menu>
 * ```
 */
export const MenuDescription = createComponent<MenuDescriptionOptions>(
  (props) => {
    const htmlProps = useMenuDescription(props);
    return createElement("p", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  MenuDescription.displayName = "MenuDescription";
}

export type MenuDescriptionOptions<T extends As = "p"> = Omit<
  HovercardDescriptionOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `useMenuStore` hook. If not provided, the parent
   * `Menu` component's context will be used.
   */
  store?: MenuStore;
};

export type MenuDescriptionProps<T extends As = "p"> = Props<
  MenuDescriptionOptions<T>
>;
