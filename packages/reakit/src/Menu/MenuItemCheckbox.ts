import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import {
  CheckboxOptions,
  useCheckbox,
  CheckboxHTMLProps
} from "../Checkbox/Checkbox";
import { unstable_createHook } from "../utils/createHook";
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

export const useMenuItemCheckbox = unstable_createHook<
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
    return mergeProps(
      {
        role: "menuitemcheckbox",
        name: options.name
      } as MenuItemCheckboxHTMLProps,
      htmlProps
    );
  }
});

export const MenuItemCheckbox = unstable_createComponent({
  as: "button",
  useHook: useMenuItemCheckbox
});
