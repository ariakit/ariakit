import { useEffect } from "react";
import { useMenubar } from "../menubar/menubar.js";
import type { MenubarOptions } from "../menubar/menubar.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";

/**
 * Returns props to create a `MenuBar` component.
 * @deprecated Use `useMenubar` instead.
 * @example
 * ```jsx
 * const store = useMenuBarStore();
 * const menuBarProps = useMenuBar({ store });
 * const fileProps = useMenuItem({ store });
 * const fileMenu = useMenuStore();
 * <Role {...menuBarProps}>
 *   <MenuButton {...fileProps} store={fileMenu}>
 *     File
 *   </MenuButton>
 *   <Menu store={fileMenu}>
 *     <MenuItem>New File</MenuItem>
 *     <MenuItem>New Window</MenuItem>
 *   </Menu>
 * </Role>
 * ```
 */
export const useMenuBar = createHook<MenuBarOptions>((props) => {
  useEffect(() => {
    console.warn(
      "MenuBar is deprecated. Use Menubar instead.",
      "See https://ariakit.org/reference/menubar",
    );
  }, []);
  return useMenubar(props);
});

/**
 * Renders a menu bar that may contain a group of menu items that control other
 * submenus.
 * @deprecated
 * Use [`Menubar`](https://ariakit.org/reference/menubar) instead.
 * @example
 * ```jsx
 * <MenuBarProvider>
 *   <MenuBar>
 *     <MenuProvider>
 *       <MenuItem render={<MenuButton />}>File</MenuItem>
 *       <Menu>
 *         <MenuItem>New File</MenuItem>
 *         <MenuItem>New Window</MenuItem>
 *       </Menu>
 *     </MenuProvider>
 *     <MenuProvider>
 *       <MenuItem render={<MenuButton />}>Edit</MenuItem>
 *       <Menu>
 *         <MenuItem>Undo</MenuItem>
 *         <MenuItem>Redo</MenuItem>
 *       </Menu>
 *     </MenuProvider>
 *   </MenuBar>
 * </MenuBarProvider>
 * ```
 */
export const MenuBar = createComponent<MenuBarOptions>((props) => {
  const htmlProps = useMenuBar(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuBar.displayName = "MenuBar";
}

export interface MenuBarOptions<T extends As = "div">
  extends MenubarOptions<T> {}

export type MenuBarProps<T extends As = "div"> = Props<MenuBarOptions<T>>;
