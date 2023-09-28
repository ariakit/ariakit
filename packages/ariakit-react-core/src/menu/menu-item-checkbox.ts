import { invariant } from "@ariakit/core/utils/misc";
import { useCheckboxStore } from "../checkbox/checkbox-store.js";
import type { CheckboxOptions } from "../checkbox/checkbox.js";
import { useCheckbox } from "../checkbox/checkbox.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useMenuScopedContext } from "./menu-context.js";
import type { MenuItemOptions } from "./menu-item.js";
import { useMenuItem } from "./menu-item.js";
import type { MenuStore } from "./menu-store.js";

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
    const context = useMenuScopedContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "MenuItemCheckbox must be wrapped in a MenuList or Menu component",
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
  },
);

/**
 * Renders a menu item checkbox inside a menu.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * <MenuProvider defaultValues={{ apple: false }}>
 *   <MenuButton>Fruits</MenuButton>
 *   <Menu>
 *     <MenuItemCheckbox name="apple">Apple</MenuItemCheckbox>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export const MenuItemCheckbox = createMemoComponent<MenuItemCheckboxOptions>(
  (props) => {
    const htmlProps = useMenuItemCheckbox(props);
    return createElement("div", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  MenuItemCheckbox.displayName = "MenuItemCheckbox";
}

export interface MenuItemCheckboxOptions<T extends As = "div">
  extends MenuItemOptions<T>,
    Omit<CheckboxOptions<T>, "store"> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
   * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
   * context will be used.
   */
  store?: MenuStore;
  /**
   * MenuItemCheckbox's name as specified in the
   * [`values`](https://ariakit.org/reference/menu-provider#values) state.
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
