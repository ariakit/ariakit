import { createContext } from "react";
import { useStore, createStoreContext } from "ariakit-utils/store";
import { DialogContext } from "../dialog/__utils/dialog-context";
import { MenuBarState } from "./menu-bar-state";
import { MenuState } from "./menu-state";

type StateFilterFn<T> = (nextState: T) => unknown;
type StateFilter<T> = Array<StateFilterFn<T> | keyof NonNullable<T>>;

export const MenuBarContext = createStoreContext<MenuBarState>();
export const MenuContext = createStoreContext<MenuState>();
export const MenuItemCheckedContext = createContext<boolean | undefined>(
  undefined
);

export function useParentMenu(filter: StateFilter<MenuState> = []) {
  const parentDialog = useStore(DialogContext, ["contentElement"]);
  const parentMenu = useStore(MenuContext, [...filter, "contentElement"]);
  const hasIntermediateDialog =
    parentDialog?.contentElement !== parentMenu?.contentElement;
  if (hasIntermediateDialog) return;
  return parentMenu;
}
