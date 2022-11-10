import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  CompositeSeparatorOptions,
  useCompositeSeparator,
} from "../composite/store-composite-separator";
import { MenuStore } from "./store-menu-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a separator for menu items.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuSeparator({ store });
 * <MenuButton store={store}>Edit</MenuButton>
 * <Menu store={store}>
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
 * const menu = useMenuStore();
 * <MenuButton store={menu}>Edit</MenuButton>
 * <Menu store={menu}>
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
  "store"
> & {
  /**
   * Object returned by the `useMenuStore` hook. If not provided, the parent
   * `Menu` component's context will be used.
   */
  store?: MenuStore;
};

export type MenuSeparatorProps<T extends As = "hr"> = Props<
  MenuSeparatorOptions<T>
>;
