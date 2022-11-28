import { useContext } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import { CheckboxOptions, useCheckbox } from "../checkbox/checkbox";
import { useCheckboxStore } from "../checkbox/checkbox-store";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system";
import { As, Props } from "../utils/types";
import { MenuContext } from "./menu-context";
import { MenuItemOptions, useMenuItem } from "./menu-item";
import { MenuStore } from "./menu-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a menu item checkbox inside a menu.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore({ defaultValues: { apple: false } });
 * const props = useMenuItemCheckbox({ store, name: "apple" });
 * <MenuButton store={store}>Fruits</MenuButton>
 * <Menu store={store}>
 *   <Role {...props}>Apple</Role>
 * </Menu>
 * ```
 */
export const useMenuItemCheckbox = createHook<MenuItemCheckboxOptions>(
  ({ store, name, checked, defaultChecked, hideOnClick = false, ...props }) => {
    const context = useContext(MenuContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "MenuItemCheckbox must be wrapped in a MenuList or MenuPopover component"
    );

    const checkboxStore = useCheckboxStore({
      value: store.useState((state) => state.values[name]),
      setValue: (value) => store?.setValue(name, value),
    });

    props = {
      role: "menuitemcheckbox",
      ...props,
    };

    props = useCheckbox({ store: checkboxStore, checked, ...props });
    props = useMenuItem({ store, hideOnClick, ...props });

    return props;
  }
);

/**
 * A component that renders a menu item checkbox inside a menu.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuStore({ defaultValues: { apple: false } });
 * <MenuButton store={menu}>Fruits</MenuButton>
 * <Menu store={menu}>
 *   <MenuItemCheckbox name="apple">Apple</MenuItemCheckbox>
 * </Menu>
 * ```
 */
export const MenuItemCheckbox = createMemoComponent<MenuItemCheckboxOptions>(
  (props) => {
    const htmlProps = useMenuItemCheckbox(props);
    return createElement("div", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  MenuItemCheckbox.displayName = "MenuItemCheckbox";
}

export type MenuItemCheckboxOptions<T extends As = "div"> = Omit<
  MenuItemOptions<T>,
  "store" | "hideOnClick"
> &
  Omit<CheckboxOptions<T>, "store"> & {
    /**
     * Object returned by the `useMenuStore` hook. If not provided, the parent
     * `Menu` component's context will be used.
     */
    store?: MenuStore;
    /**
     * MenuItemCheckbox's name as in `menu.values`.
     */
    name: string;
    /**
     * Whether to hide the menu when the menu item checkbox is clicked.
     * @default false
     */
    hideOnClick?: MenuItemOptions<T>["hideOnClick"];
  };

export type MenuItemCheckboxProps<T extends As = "div"> = Props<
  MenuItemCheckboxOptions<T>
>;
