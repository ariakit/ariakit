import type { ElementType } from "react";
import { useMenubar } from "../menubar/menubar.js";
import type { MenubarOptions } from "../menubar/menubar.js";
import { createElement, createHook2, forwardRef } from "../utils/system.js";
import type { Props2 } from "../utils/types.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

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
export const useMenuBar = createHook2<TagName, MenuBarOptions>(
  function useMenuBar(props) {
    return useMenubar(props);
  },
);

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
export const MenuBar = forwardRef(function MenuBar(props: MenuBarProps) {
  const htmlProps = useMenuBar(props);
  return createElement(TagName, htmlProps);
});

export interface MenuBarOptions<T extends ElementType = TagName>
  extends MenubarOptions<T> {}

export type MenuBarProps<T extends ElementType = TagName> = Props2<
  T,
  MenuBarOptions<T>
>;
