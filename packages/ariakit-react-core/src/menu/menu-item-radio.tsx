import { ChangeEvent, useContext } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import { RadioOptions, useRadio } from "../radio/radio.js";
import { useWrapElement } from "../utils/hooks.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import { As, Props } from "../utils/types.js";
import { MenuContext, MenuItemCheckedContext } from "./menu-context.js";
import { MenuItemOptions, useMenuItem } from "./menu-item.js";
import { MenuStore } from "./menu-store.js";

/**
 * Returns props to create a `MenuItemRadio` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore({ defaultValues: { fruit: "apple" } });
 * const apple = useMenuItemRadio({ store, name: "fruit", value: "apple" });
 * const orange = useMenuItemRadio({ store, name: "fruit", value: "orange" });
 * <MenuButton store={store}>Fruit</MenuButton>
 * <Menu store={store}>
 *   <Role {...apple}>Apple</Role>
 *   <Role {...orange}>Orange</Role>
 * </Menu>
 * ```
 */
export const useMenuItemRadio = createHook<MenuItemRadioOptions>(
  ({
    store,
    name,
    value,
    checked,
    onChange: onChangeProp,
    hideOnClick = false,
    ...props
  }) => {
    const context = useContext(MenuContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "MenuItemRadio must be wrapped in a MenuList or MenuPopover component"
    );

    const isChecked = store.useState(
      (state) => checked ?? state.values[name] === value
    );

    props = useWrapElement(
      props,
      (element) => (
        <MenuItemCheckedContext.Provider value={!!isChecked}>
          {element}
        </MenuItemCheckedContext.Provider>
      ),
      [isChecked]
    );

    props = {
      role: "menuitemradio",
      ...props,
    };

    props = useRadio({
      value,
      checked: isChecked,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        onChangeProp?.(event);
        if (event.defaultPrevented) return;
        store?.setValue(name, value);
      },
      ...props,
    });

    props = useMenuItem({ store, hideOnClick, ...props });

    return props;
  }
);

/**
 * Renders a menu item radio inside a menu.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuStore({ defaultValues: { fruit: "apple" } });
 * <MenuButton store={menu}>Fruit</MenuButton>
 * <Menu store={menu}>
 *   <MenuItemRadio name="fruit" value="apple">
 *     Apple
 *   </MenuItemRadio>
 *   <MenuItemRadio name="fruit" value="orange">
 *     Orange
 *   </MenuItemRadio>
 * </Menu>
 * ```
 */
export const MenuItemRadio = createMemoComponent<MenuItemRadioOptions>(
  (props) => {
    const htmlProps = useMenuItemRadio(props);
    return createElement("div", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  MenuItemRadio.displayName = "MenuItemRadio";
}

export interface MenuItemRadioOptions<T extends As = "div">
  extends MenuItemOptions<T>,
    Omit<RadioOptions<T>, "store"> {
  /**
   * Object returned by the `useMenuStore` hook. If not provided, the parent
   * `Menu` component's context will be used.
   */
  store?: MenuStore;
  /**
   * MenuItemRadio's name as in `menu.values`.
   */
  name: string;
  /**
   * @default false
   */
  hideOnClick?: MenuItemOptions<T>["hideOnClick"];
}

export type MenuItemRadioProps<T extends As = "div"> = Props<
  MenuItemRadioOptions<T>
>;
