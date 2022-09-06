import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  PopoverDisclosureArrowOptions,
  usePopoverDisclosureArrow,
} from "../popover/popover-disclosure-arrow";
import { MenuState } from "./menu-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow pointing to the menu position, usually
 * inside a `MenuButton`.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const state = useMenuState();
 * const props = useMenuButtonArrow({ state });
 * <MenuButton state={state}>
 *   Edit
 *   <Role {...props} />
 * </MenuButton>
 * <Menu state={state}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export const useMenuButtonArrow = createHook<MenuButtonArrowOptions>(
  ({ state, ...props }) => {
    props = usePopoverDisclosureArrow({ state, ...props });
    return props;
  }
);

/**
 * A component that renders an arrow pointing to the menu position, usually
 * inside a `MenuButton`.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuState();
 * <MenuButton state={menu}>
 *   Edit
 *   <MenuButtonArrow />
 * </MenuButton>
 * <Menu state={menu}>
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
  "state"
> & {
  /**
   * Object returned by the `useMenuState` hook. If not provided, the parent
   * `MenuButton` component's context will be used.
   */
  state?: MenuState;
};

export type MenuButtonArrowProps<T extends As = "span"> = Props<
  MenuButtonArrowOptions<T>
>;
