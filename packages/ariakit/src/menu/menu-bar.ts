import {
  createHook,
  createComponent,
  createElement,
} from "ariakit-utils/system";
import { useStoreProvider } from "ariakit-utils/store";
import { As, Props } from "ariakit-utils/types";
import { CompositeOptions, useComposite } from "../composite/composite";
import { MenuBarState } from "./menu-bar-state";
import { MenuBarContext } from "./__utils";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a menu bar that may contain a group of menu items
 * that control other submenus.
 * @see https://ariakit.org/docs/menu
 * @example
 * ```jsx
 * const state = useMenuBarState();
 * const menuBarProps = useMenuBar({ state });
 * const fileProps = useMenuItem({ state });
 * const fileMenu = useMenuState();
 * <Role {...menuBarProps}>
 *   <MenuButton {...fileProps} state={fileMenu}>
 *     File
 *   </MenuButton>
 *   <Menu state={fileMenu}>
 *     <MenuItem>New File</MenuItem>
 *     <MenuItem>New Window</MenuItem>
 *   </Menu>
 * </Role>
 * ```
 */
export const useMenuBar = createHook<MenuBarOptions>(({ state, ...props }) => {
  const orientation =
    state.orientation === "both" ? undefined : state.orientation;

  props = useStoreProvider({ state, ...props }, MenuBarContext);

  props = {
    role: "menubar",
    "aria-orientation": orientation,
    ...props,
  };

  props = useComposite({ state, ...props });

  return props;
});

/**
 * A component that renders a menu bar that may contain a group of menu items
 * that control other submenus.
 * @see https://ariakit.org/docs/menu
 * @example
 * ```jsx
 * const state = useMenuBarState();
 * const fileProps = useMenuItem({ state });
 * const editProps = useMenuItem({ state });
 * const fileMenu = useMenuState();
 * const editMenu = useMenuState();
 * <MenuBar state={state}>
 *   <MenuButton {...fileProps} state={fileMenu}>
 *     File
 *   </MenuButton>
 *   <Menu state={fileMenu}>
 *     <MenuItem>New File</MenuItem>
 *     <MenuItem>New Window</MenuItem>
 *   </Menu>
 *   <MenuButton {...editProps} state={editMenu}>
 *     Edit
 *   </MenuButton>
 *   <Menu state={editMenu}>
 *     <MenuItem>Undo</MenuItem>
 *     <MenuItem>Redo</MenuItem>
 *   </Menu>
 * </MenuBar>
 * ```
 */
export const MenuBar = createComponent<MenuBarOptions>((props) => {
  const htmlProps = useMenuBar(props);
  return createElement("div", htmlProps);
});

export type MenuBarOptions<T extends As = "div"> = Omit<
  CompositeOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useMenuBarState` hook.
   */
  state: MenuBarState;
};

export type MenuBarProps<T extends As = "div"> = Props<MenuBarOptions<T>>;
