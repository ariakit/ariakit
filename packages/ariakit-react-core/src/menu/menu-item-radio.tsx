"use client";
import { useEffect } from "react";
import type { ChangeEvent } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { RadioOptions } from "../radio/radio.js";
import { useRadio } from "../radio/radio.js";
import { useInitialValue, useWrapElement } from "../utils/hooks.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import {
  MenuItemCheckedContext,
  useMenuScopedContext,
} from "./menu-context.js";
import type { MenuItemOptions } from "./menu-item.js";
import { useMenuItem } from "./menu-item.js";
import type { MenuStore } from "./menu-store.js";

function getValue<T>(prevValue: T, value: T, checked?: boolean) {
  if (checked === undefined) return prevValue;
  if (checked) return value;
  return prevValue;
}

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
    const context = useMenuScopedContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "MenuItemRadio must be wrapped in a MenuList or Menu component",
    );

    const defaultChecked = useInitialValue(props.defaultChecked);

    // Sets defaultChecked in store
    useEffect(() => {
      store?.setValue(name, (prevValue = false) => {
        return getValue(prevValue, value, defaultChecked);
      });
    }, [store, name, value, defaultChecked]);

    // Sets checked in store
    useEffect(() => {
      if (checked === undefined) return;
      store?.setValue(name, (prevValue) => {
        return getValue(prevValue, value, checked);
      });
    }, [store, name, value, checked]);

    const isChecked = store.useState((state) => state.values[name] === value);

    props = useWrapElement(
      props,
      (element) => (
        <MenuItemCheckedContext.Provider value={!!isChecked}>
          {element}
        </MenuItemCheckedContext.Provider>
      ),
      [isChecked],
    );

    props = {
      role: "menuitemradio",
      ...props,
    };

    props = useRadio({
      name,
      value,
      checked: isChecked,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        onChangeProp?.(event);
        if (event.defaultPrevented) return;
        const element = event.currentTarget;
        store?.setValue(name, (prevValue) => {
          return getValue(prevValue, value, checked ?? element.checked);
        });
      },
      ...props,
    });

    props = useMenuItem({ store, hideOnClick, ...props });

    return props;
  },
);

/**
 * Renders a menu item radio inside a menu.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * <MenuProvider defaultValues={{ fruit: "apple" }}>
 *   <MenuButton>Fruit</MenuButton>
 *   <Menu>
 *     <MenuItemRadio name="fruit" value="apple">
 *       Apple
 *     </MenuItemRadio>
 *     <MenuItemRadio name="fruit" value="orange">
 *       Orange
 *     </MenuItemRadio>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export const MenuItemRadio = createMemoComponent<MenuItemRadioOptions>(
  (props) => {
    const htmlProps = useMenuItemRadio(props);
    return createElement("div", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  MenuItemRadio.displayName = "MenuItemRadio";
}

export interface MenuItemRadioOptions<T extends As = "div">
  extends MenuItemOptions<T>,
    Omit<RadioOptions<T>, "store"> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
   * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
   * context will be used.
   */
  store?: MenuStore;
  /**
   * MenuItemRadio's name as specified in the
   * [`values`](https://ariakit.org/reference/menu-provider#values) state.
   */
  name: string;
  /**
   * The controlled checked state of the element. It will set the menu
   * [`values`](https://ariakit.org/reference/menu-provider#values) state if
   * provided.
   */
  checked?: boolean;
  /**
   * The default checked state of the element. It will set the default value in
   * the menu [`values`](https://ariakit.org/reference/menu-provider#values)
   * state if provided.
   */
  defaultChecked?: boolean;
  /**
   * @default false
   */
  hideOnClick?: MenuItemOptions<T>["hideOnClick"];
}

export type MenuItemRadioProps<T extends As = "div"> = Props<
  MenuItemRadioOptions<T>
>;
