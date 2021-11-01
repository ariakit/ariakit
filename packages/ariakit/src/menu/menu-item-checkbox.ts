import { useCallback } from "react";
import { useStore, createMemoComponent } from "ariakit-utils/store";
import { createHook, createElement } from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CheckboxOptions,
  CheckboxState,
  useCheckbox,
  useCheckboxState,
} from "../checkbox";
import { MenuItemOptions, useMenuItem } from "./menu-item";
import { MenuState } from "./menu-state";
import { MenuContext } from "./__utils";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a menu item checkbox inside a menu.
 * @see https://ariakit.org/docs/menu
 * @example
 * ```jsx
 * const state = useMenuState({ defaultValues: { apple: false } });
 * const props = useMenuItemCheckbox({ state, name: "apple" });
 * <MenuButton state={state}>Fruits</MenuButton>
 * <Menu state={state}>
 *   <Role {...props}>Apple</Role>
 * </Menu>
 * ```
 */
export const useMenuItemCheckbox = createHook<MenuItemCheckboxOptions>(
  ({ state, name, checked, defaultChecked, hideOnClick = false, ...props }) => {
    state = useStore(state || MenuContext, [
      "setValue",
      useCallback((s: MenuState) => s.values[name], [name]),
    ]);

    const setValue: CheckboxState["setValue"] = useCallback(
      (value) => state?.setValue(name, value),
      [state?.setValue, name]
    );

    const checkboxState = useCheckboxState({
      value: state?.values[name],
      setValue,
    });

    props = {
      role: "menuitemcheckbox",
      ...props,
    };

    props = useCheckbox({
      state: checkboxState,
      checked,
      clickOnEnter: true,
      ...props,
    });

    props = useMenuItem({ state, hideOnClick, ...props });

    return props;
  }
);

/**
 * A component that renders a menu item checkbox inside a menu.
 * @see https://ariakit.org/docs/menu
 * @example
 * ```jsx
 * const menu = useMenuState({ defaultValues: { apple: false } });
 * <MenuButton state={menu}>Fruits</MenuButton>
 * <Menu state={menu}>
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

export type MenuItemCheckboxOptions<T extends As = "div"> = Omit<
  MenuItemOptions<T>,
  "state" | "hideOnClick"
> &
  Omit<CheckboxOptions<T>, "state"> & {
    /**
     * Object returned by the `useMenuState` hook. If not provided, the parent
     * `Menu` component's context will be used.
     */
    state?: MenuState;
    /**
     * MenuItemCheckbox's name as in `menu.values`.
     */
    name: string;
    /**
     * Whether to hide the menu when the menu item checkbox is clicked.
     * @default false
     */
    hideOnClick?: boolean;
  };

export type MenuItemCheckboxProps<T extends As = "div"> = Props<
  MenuItemCheckboxOptions<T>
>;
