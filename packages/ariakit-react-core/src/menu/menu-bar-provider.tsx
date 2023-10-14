"use client";
import type { ReactNode } from "react";
import { useMenuBarStore } from "./menu-bar-store.js";
import type { MenuBarStoreProps } from "./menu-bar-store.js";
import { MenuBarContextProvider } from "./menu-context.js";

/**
 * Provides a menubar store to MenuBar components.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * <MenuBarProvider>
 *   <MenuBar>
 *     <MenuProvider>
 *       <MenuButton>File</MenuButton>
 *       <Menu>
 *         <MenuItem>New File</MenuItem>
 *         <MenuItem>New Window</MenuItem>
 *       </Menu>
 *     </MenuProvider>
 *     <MenuProvider>
 *       <MenuButton>Edit</MenuButton>
 *       <Menu>
 *         <MenuItem>Undo</MenuItem>
 *         <MenuItem>Redo</MenuItem>
 *       </Menu>
 *     </MenuProvider>
 *   </MenuBar>
 * </MenuBarProvider>
 * ```
 */
export function MenuBarProvider(props: MenuBarProviderProps = {}) {
  const store = useMenuBarStore(props);
  return (
    <MenuBarContextProvider value={store}>
      {props.children}
    </MenuBarContextProvider>
  );
}

export interface MenuBarProviderProps extends MenuBarStoreProps {
  children?: ReactNode;
}
