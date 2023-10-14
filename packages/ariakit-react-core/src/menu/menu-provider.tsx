"use client";
import type { ReactElement, ReactNode } from "react";
import type { PickRequired } from "@ariakit/core/utils/types";
import { MenuContextProvider } from "./menu-context.js";
import { useMenuStore } from "./menu-store.js";
import type { MenuStoreProps, MenuStoreValues } from "./menu-store.js";

type Values = MenuStoreValues;

/**
 * Provides a menu store to Menu components.
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
