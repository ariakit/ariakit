import { invariant, shallowEqual } from "@ariakit/core/utils/misc";
import { useEffect } from "react";
import type { ElementType } from "react";
import { useCheckboxStore } from "../checkbox/checkbox-store.ts";
import type { CheckboxOptions } from "../checkbox/checkbox.tsx";
import { useCheckbox } from "../checkbox/checkbox.tsx";
import { useInitialValue } from "../utils/hooks.ts";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useMenuScopedContext } from "./menu-context.tsx";
import type { MenuItemOptions } from "./menu-item.tsx";
import { useMenuItem } from "./menu-item.tsx";
import type { MenuStore, MenuStoreValues } from "./menu-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
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
export const useMenuItemCheckbox = createHook<TagName, MenuItemCheckboxOptions>(
  function useMenuItemCheckbox({
    store,
    name,
    value,
    checked,
    defaultChecked: defaultCheckedProp,
    hideOnClick = false,
    ...props
  }) {
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

    props = useCheckbox<TagName>({
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
 * Renders a [`menuitemcheckbox`](https://w3c.github.io/aria/#menuitemcheckbox)
 * element within a [`Menu`](https://ariakit.org/reference/menu) component. The
 * [`name`](https://ariakit.org/reference/menu-item-checkbox#name) prop must be
 * provided to identify the field in the
 * [`values`](https://ariakit.org/reference/menu-provider#values) state.
 *
 * A [`MenuItemCheck`](https://ariakit.org/reference/menu-item-check) can be
 * used to render a checkmark inside this component.
 * @see https://ariakit.org/components/menu
 * @example
 * The [`name`](https://ariakit.org/reference/menu-item-checkbox#name) prop can
 * refer to a single value in the state:
 * ```jsx {4-7}
 * <MenuProvider defaultValues={{ warnBeforeQuitting: true }}>
 *   <MenuButton>Chrome</MenuButton>
 *   <Menu>
 *     <MenuItemCheckbox name="warnBeforeQuitting">
 *       <MenuItemCheck />
 *       Warn Before Quitting
 *     </MenuItemCheckbox>
 *   </Menu>
 * </MenuProvider>
 * ```
 * @example
 * Or it can refer to an array of values, in which case the
 * [`value`](https://ariakit.org/reference/menu-item-checkbox#value) prop must
 * be provided:
 * ```jsx {4-9}
 * <MenuProvider defaultValues={{ watching: ["issues"] }}>
 *   <MenuButton>Watch</MenuButton>
 *   <Menu>
 *     <MenuItemCheckbox name="watching" value="issues">
 *       Issues
 *     </MenuItemCheckbox>
 *     <MenuItemCheckbox name="watching" value="pull-requests">
 *       Pull Requests
 *     </MenuItemCheckbox>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export const MenuItemCheckbox = memo(
  forwardRef(function MenuItemCheckbox(props: MenuItemCheckboxProps) {
    const htmlProps = useMenuItemCheckbox(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface MenuItemCheckboxOptions<T extends ElementType = TagName>
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
   * The name of the field in the
   * [`values`](https://ariakit.org/reference/menu-provider#values) state.
   *
   * Live examples:
   * - [MenuItemCheckbox](https://ariakit.org/examples/menu-item-checkbox)
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

export type MenuItemCheckboxProps<T extends ElementType = TagName> = Props<
  T,
  MenuItemCheckboxOptions<T>
>;
