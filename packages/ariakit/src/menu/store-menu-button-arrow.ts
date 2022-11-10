import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  PopoverDisclosureArrowOptions,
  usePopoverDisclosureArrow,
} from "../popover/store-popover-disclosure-arrow";
import { MenuStore } from "./store-menu-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow pointing to the menu position, usually
 * inside a `MenuButton`.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuButtonArrow({ store });
 * <MenuButton store={store}>
 *   Edit
 *   <Role {...props} />
 * </MenuButton>
 * <Menu store={store}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export const useMenuButtonArrow = createHook<MenuButtonArrowOptions>(
  ({ store, ...props }) => {
    props = usePopoverDisclosureArrow({ store, ...props });
    return props;
  }
);

/**
 * A component that renders an arrow pointing to the menu position, usually
 * inside a `MenuButton`.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuStore();
 * <MenuButton store={menu}>
 *   Edit
 *   <MenuButtonArrow />
 * </MenuButton>
 * <Menu store={menu}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export const MenuButtonArrow = createComponent<MenuButtonArrowOptions>(
  (props) => {
    const htmlProps = useMenuButtonArrow(props);
    return createElement("span", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  MenuButtonArrow.displayName = "MenuButtonArrow";
}

export type MenuButtonArrowOptions<T extends As = "span"> = Omit<
  PopoverDisclosureArrowOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `useMenuStore` hook. If not provided, the parent
   * `MenuButton` component's context will be used.
   */
  store?: MenuStore;
};

export type MenuButtonArrowProps<T extends As = "span"> = Props<
  MenuButtonArrowOptions<T>
>;
