import { useEffect } from "react";
import type { ElementType } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { RadioOptions } from "../radio/radio.js";
import { useRadio } from "../radio/radio.js";
import { useInitialValue, useWrapElement } from "../utils/hooks.js";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.js";
import type { Props } from "../utils/types.js";
import {
  MenuItemCheckedContext,
  useMenuScopedContext,
} from "./menu-context.js";
import type { MenuItemOptions } from "./menu-item.js";
import { useMenuItem } from "./menu-item.js";
import type { MenuStore } from "./menu-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

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
export const useMenuItemRadio = createHook<TagName, MenuItemRadioOptions>(
  function useMenuItemRadio({
    store,
    name,
    value,
    checked,
    onChange: onChangeProp,
    hideOnClick = false,
    ...props
  }) {
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

    props = useRadio<TagName>({
      name,
      value,
      checked: isChecked,
      onChange(event) {
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
 * Renders a [`menuitemradio`](https://w3c.github.io/aria/#menuitemradio)
 * element within a [`Menu`](https://ariakit.org/reference/menu) component. The
 * [`name`](https://ariakit.org/reference/menu-item-radio#name) prop must be
 * provided to identify the field in the
 * [`values`](https://ariakit.org/reference/menu-provider#values) state.
 *
 * A [`MenuItemCheck`](https://ariakit.org/reference/menu-item-check) can be
 * used to render a checkmark inside this component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {4-11}
 * <MenuProvider defaultValues={{ profile: "john" }}>
 *   <MenuButton>Profiles</MenuButton>
 *   <Menu>
 *     <MenuItemRadio name="profile" value="john">
 *       <MenuItemCheck />
 *       John Doe
 *     </MenuItemRadio>
 *     <MenuItemRadio name="profile" value="jane">
 *       <MenuItemCheck />
 *       Jane Doe
 *     </MenuItemRadio>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export const MenuItemRadio = memo(
  forwardRef(function MenuItemRadio(props: MenuItemRadioProps) {
    const htmlProps = useMenuItemRadio(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface MenuItemRadioOptions<T extends ElementType = TagName>
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
   * The name of the field in the
   * [`values`](https://ariakit.org/reference/menu-provider#values) state.
   *
   * Live examples:
   * - [MenuItemRadio](https://ariakit.org/examples/menu-item-radio)
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

export type MenuItemRadioProps<T extends ElementType = TagName> = Props<
  T,
  MenuItemRadioOptions<T>
>;
