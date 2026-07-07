import type { ProviderComponent } from "@ariakit/react-utils";
import type { PickRequired } from "@ariakit/utils";
import type { ReactElement, ReactNode } from "react";
import { createMenuProvider, MenuContextProvider } from "./menu-context.tsx";
import type {
  MenuStore,
  MenuStoreProps,
  MenuStoreValues,
} from "./menu-store.ts";
import { useMenuStore } from "./menu-store.ts";

type Values = MenuStoreValues;

export interface MenuProviderComponent extends ProviderComponent<MenuStore> {
  <T extends Values = Values>(
    props: PickRequired<MenuProviderProps<T>, "values" | "defaultValues">,
  ): ReactElement;
  (props?: MenuProviderProps): ReactElement;
}

/**
 * Provides a menu store to [Menu](https://ariakit.com/components/menu)
 * components.
 * @see https://ariakit.com/components/menu
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
export const MenuProvider: MenuProviderComponent = createMenuProvider(
  function MenuProvider(props: MenuProviderProps = {}) {
    const store = useMenuStore(props);
    return (
      <MenuContextProvider value={store}>{props.children}</MenuContextProvider>
    );
  },
);

export interface MenuProviderProps<
  T extends Values = Values,
> extends MenuStoreProps<T> {
  children?: ReactNode;
}
