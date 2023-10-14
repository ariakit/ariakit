import { useEffect } from "react";
import { invariant, shallowEqual } from "@ariakit/core/utils/misc";
import { useCheckboxStore } from "../checkbox/checkbox-store.js";
import type { CheckboxOptions } from "../checkbox/checkbox.js";
import { useCheckbox } from "../checkbox/checkbox.js";
import { useInitialValue } from "../utils/hooks.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useMenuScopedContext } from "./menu-context.js";
import type { MenuItemOptions } from "./menu-item.js";
import { useMenuItem } from "./menu-item.js";
import type { MenuStore, MenuStoreValues } from "./menu-store.js";

type ValueState = MenuStoreValues[string];

function getPrimitiveValue<T>(value: T) {
  if (Array.isArray(value)) {
    return value.toString();
  }
  return value as Exclude<T, readonly any[]>;
}

function getValue(
  storeValue: ValueState,
  value?: MenuItemCheckboxOptions["value"],
  checked?: MenuItemCheckboxOptions["checked"],
) {
  if (value === undefined) {
    if (Array.isArray(storeValue)) return storeValue;
    return !!checked;
  }
  const primitiveValue = getPrimitiveValue(value);
  if (!Array.isArray(storeValue)) {
    if (checked) {
      return primitiveValue;
    }
    return storeValue === primitiveValue ? false : storeValue;
  }
  if (checked) {
    if (storeValue.includes(primitiveValue)) {
      return storeValue;
    }
    return [...storeValue, primitiveValue];
  }
  return storeValue.filter((v) => v !== primitiveValue);
}

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
  ({
    store,
    name,
    value,
    checked,
    defaultChecked: defaultCheckedProp,
    hideOnClick = false,
    ...props
  }) => {
    const context = useMenuScopedContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "MenuItemCheckbox must be wrapped in a MenuList or Menu component",
    );

    const defaultChecked = useInitialValue(defaultCheckedProp);

    // Sets defaultChecked in store
    useEffect(() => {
      store?.setValue(name, (prevValue = []) => {
        if (!defaultChecked) return prevValue;
        return getValue(prevValue, value, true);
      });
    }, [store, name, value, defaultChecked]);

    // Sets checked in store
    useEffect(() => {
      if (checked === undefined) return;
      store?.setValue(name, (prevValue) => {
        return getValue(prevValue, value, checked);
      });
    }, [store, name, value, checked]);

    const checkboxStore = useCheckboxStore({
      value: store.useState((state) => state.values[name]),
      setValue(internalValue) {
        store?.setValue(name, () => {
          if (checked === undefined) return internalValue;
          const nextValue = getValue(internalValue, value, checked);
          if (!Array.isArray(nextValue)) return nextValue;
          if (!Array.isArray(internalValue)) return nextValue;
          if (shallowEqual(internalValue, nextValue)) return internalValue;
          return nextValue;
        });
      },
    });

    props = {
      role: "menuitemcheckbox",
      ...props,
    };

    props = useCheckbox({
      store: checkboxStore,
      name,
      value,
      checked,
      ...props,
    });
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

export type MenuItemCheckboxProps<T extends As = "div"> = Props<
  MenuItemCheckboxOptions<T>
>;
