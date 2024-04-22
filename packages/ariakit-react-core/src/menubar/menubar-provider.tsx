import type { ReactNode } from "react";
import { MenubarContextProvider } from "./menubar-context.tsx";
import { useMenubarStore } from "./menubar-store.ts";
import type { MenubarStoreProps } from "./menubar-store.ts";

/**
 * Provides a menubar store to [Menubar](https://ariakit.org/components/menubar)
 * components.
 * @see https://ariakit.org/components/menubar
 * @example
 * ```jsx
 * <MenubarProvider>
 *   <Menubar>
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
 *   </Menubar>
 * </MenubarProvider>
 * ```
 */
export function MenubarProvider(props: MenubarProviderProps = {}) {
  const store = useMenubarStore(props);
  return (
    <MenubarContextProvider value={store}>
      {props.children}
    </MenubarContextProvider>
  );
}

export interface MenubarProviderProps extends MenubarStoreProps {
  children?: ReactNode;
}
