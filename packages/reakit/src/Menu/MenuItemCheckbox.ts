import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import {
  CheckboxOptions,
  useCheckbox,
  CheckboxProps
} from "../Checkbox/Checkbox";
import { unstable_createHook } from "../utils/createHook";
import { MenuItemOptions, MenuItemProps, useMenuItem } from "./MenuItem";
import { MenuStateReturn, useMenuState } from "./MenuState";

export type MenuItemCheckboxOptions = CheckboxOptions &
  MenuItemOptions &
  Pick<MenuStateReturn, "unstable_values" | "unstable_update"> & {
    /**
     * MenuItemCheckbox's name as in `menu.values`.
     */
    name: string;
  };

export type MenuItemCheckboxProps = CheckboxProps & MenuItemProps;

export const useMenuItemCheckbox = unstable_createHook<
  MenuItemCheckboxOptions,
  MenuItemCheckboxProps
>({
  name: "MenuItemCheckbox",
  compose: [useMenuItem, useCheckbox],
  useState: useMenuState,
  keys: ["name"],

  useOptions(options) {
    const setValue = React.useCallback(
      value => options.unstable_update(options.name, value),
      [options.unstable_update, options.name]
    );

    return {
      ...options,
      currentValue: options.unstable_values[options.name],
      setValue
    };
  },

  useProps(options, htmlProps) {
    return mergeProps(
      {
        role: "menuitemcheckbox",
        name: options.name
      } as MenuItemCheckboxProps,
      htmlProps
    );
  }
});

export const MenuItemCheckbox = unstable_createComponent({
  as: "button",
  useHook: useMenuItemCheckbox
});
