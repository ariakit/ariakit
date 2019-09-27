import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import {
  CheckboxOptions,
  useCheckbox,
  CheckboxHTMLProps
} from "../Checkbox/Checkbox";
import { MenuItemOptions, MenuItemHTMLProps, useMenuItem } from "./MenuItem";
import { MenuStateReturn, useMenuState } from "./MenuState";

export type MenuItemCheckboxOptions = CheckboxOptions &
  MenuItemOptions &
  Pick<MenuStateReturn, "unstable_values" | "unstable_update"> & {
    /**
     * MenuItemCheckbox's name as in `menu.values`.
     */
    name: string;
  };

export type MenuItemCheckboxHTMLProps = CheckboxHTMLProps & MenuItemHTMLProps;

export type MenuItemCheckboxProps = MenuItemCheckboxOptions &
  MenuItemCheckboxHTMLProps;

export const useMenuItemCheckbox = createHook<
  MenuItemCheckboxOptions,
  MenuItemCheckboxHTMLProps
>({
  name: "MenuItemCheckbox",
  compose: [useMenuItem, useCheckbox],
  useState: useMenuState,
  keys: ["name"],

  useOptions(options) {
    const setState = React.useCallback(
      value => options.unstable_update(options.name, value),
      [options.unstable_update, options.name]
    );

    return {
      ...options,
      state: options.unstable_values[options.name],
      setState
    };
  },

  useProps(options, htmlProps) {
    return {
      role: "menuitemcheckbox",
      name: options.name,
      ...htmlProps
    };
  }
});

export const MenuItemCheckbox = createComponent({
  as: "button",
  useHook: useMenuItemCheckbox
});
