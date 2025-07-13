import type { PickRequired } from "@ariakit/core/utils/types";
import type { ReactElement, ReactNode } from "react";
import { MenuContextProvider } from "./menu-context.tsx";
import type { MenuStoreProps, MenuStoreValues } from "./menu-store.ts";
import { useMenuStore } from "./menu-store.ts";

type Values = MenuStoreValues;

/**
 * Provides a menu store to [Menu](https://ariakit.org/components/menu)
 * components.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * <MenuProvider placement="top">
 *   <MenuButton>Edit</MenuButton>
 *   <Menu>
 *     <MenuItem>Undo</MenuItem>
 *     <MenuItem>Redo</MenuItem>
 *   </Menu>
 * </MenuProvider>
 * ```
 */

export function MenuProvider<T extends Values = Values>(
  props: PickRequired<MenuProviderProps<T>, "values" | "defaultValues">,
): ReactElement;

export function MenuProvider(props?: MenuProviderProps): ReactElement;

export function MenuProvider(props: MenuProviderProps = {}) {
  const store = useMenuStore(props);
  return (
    <MenuContextProvider value={store}>{props.children}</MenuContextProvider>
  );
}

export interface MenuProviderProps<T extends Values = Values>
  extends MenuStoreProps<T> {
  children?: ReactNode;
}
