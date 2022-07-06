import { ChangeEvent, useCallback } from "react";
import { useWrapElement } from "ariakit-utils/hooks";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { RadioOptions, useRadio } from "../radio/radio";
import { MenuContext, MenuItemCheckedContext } from "./__utils";
import { MenuItemOptions, useMenuItem } from "./menu-item";
import { MenuState } from "./menu-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a menu item radio inside a menu.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const state = useMenuState({ defaultValues: { fruit: "apple" } });
 * const apple = useMenuItemRadio({ state, name: "fruit", value: "apple" });
 * const orange = useMenuItemRadio({ state, name: "fruit", value: "orange" });
 * <MenuButton state={state}>Fruit</MenuButton>
 * <Menu state={state}>
 *   <Role {...apple}>Apple</Role>
 *   <Role {...orange}>Orange</Role>
 * </Menu>
 * ```
 */
export const useMenuItemRadio = createHook<MenuItemRadioOptions>(
  ({
    state,
    name,
    value,
    checked,
    onChange: onChangeProp,
    hideOnClick = false,
    ...props
  }) => {
    state = useStore(state || MenuContext, [
      "setValue",
      useCallback((s: MenuState) => s.values[name], [name]),
    ]);

    checked = checked ?? state?.values[name] === value;

    props = useWrapElement(
      props,
      (element) => (
        <MenuItemCheckedContext.Provider value={!!checked}>
          {element}
        </MenuItemCheckedContext.Provider>
      ),
      [checked]
    );

    props = {
      role: "menuitemradio",
      ...props,
    };

    props = useRadio({
      value,
      checked,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        onChangeProp?.(event);
        if (event.defaultPrevented) return;
        state?.setValue(name, value);
      },
      ...props,
    });

    props = useMenuItem({ state, hideOnClick, ...props });

    return props;
  }
);

/**
 * A component that renders a menu item radio inside a menu.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuState({ defaultValues: { fruit: "apple" } });
 * <MenuButton state={menu}>Fruit</MenuButton>
 * <Menu state={menu}>
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

export type MenuItemRadioOptions<T extends As = "div"> = Omit<
  MenuItemOptions<T>,
  "hideOnClick"
> &
  Omit<RadioOptions<T>, "state"> & {
    /**
     * Object returned by the `useMenuState` hook. If not provided, the parent
     * `Menu` component's context will be used.
     */
    state?: MenuState;
    /**
     * MenuItemRadio's name as in `menu.values`.
     */
    name: string;
    /**
     * Whether to hide the menu when the menu item radio is clicked.
     * @default false
     */
    hideOnClick?: MenuItemOptions<T>["hideOnClick"];
  };

export type MenuItemRadioProps<T extends As = "div"> = Props<
  MenuItemRadioOptions<T>
>;
