import { useContext } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import { useCheckboxStore } from "../checkbox/checkbox-store.js";
import { CheckboxOptions, useCheckbox } from "../checkbox/checkbox.jsx";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.jsx";
import { As, Props } from "../utils/types.js";
import { MenuContext } from "./menu-context.js";
import { MenuItemOptions, useMenuItem } from "./menu-item.js";
import { MenuStore } from "./menu-store.js";

/**
 * Returns props to create a `MenuItemCheckbox` component.
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
 * Renders a menu item checkbox inside a menu.
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

export interface MenuItemCheckboxOptions<T extends As = "div">
  extends MenuItemOptions<T>,
    Omit<CheckboxOptions<T>, "store"> {
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
   * @default false
   */
  hideOnClick?: MenuItemOptions<T>["hideOnClick"];
}

export type MenuItemCheckboxProps<T extends As = "div"> = Props<
  MenuItemCheckboxOptions<T>
>;
