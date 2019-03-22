import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import { unstable_CheckboxOptions, useCheckbox } from "../Checkbox/Checkbox";
import {
  unstable_MenuItemOptions,
  unstable_MenuItemProps,
  useMenuItem
} from "./MenuItem";
import { useMenuState, unstable_MenuStateReturn } from "./MenuState";

export type unstable_MenuItemCheckboxOptions = unstable_CheckboxOptions &
  unstable_MenuItemOptions &
  Partial<unstable_MenuStateReturn> &
  Pick<unstable_MenuStateReturn, "values" | "update"> & {
    /** TODO: Description */
    name: string;
  };

export type unstable_MenuItemCheckboxProps = unstable_MenuItemProps &
  React.InputHTMLAttributes<any>;

export function useMenuItemCheckbox(
  options: unstable_MenuItemCheckboxOptions,
  htmlProps: unstable_MenuItemCheckboxProps = {}
) {
  const currentValue = options.values[options.name];
  const setValue = (value: any) => options.update(options.name, value);

  htmlProps = mergeProps(
    {
      role: "menuitemcheckbox"
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useCheckbox({ ...options, currentValue, setValue }, htmlProps);
  htmlProps = useMenuItem(options, htmlProps);
  htmlProps = useHook("useMenuItemCheckbox", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_MenuItemCheckboxOptions> = [
  ...useCheckbox.keys,
  ...useMenuItem.keys,
  ...useMenuState.keys,
  "name"
];

useMenuItemCheckbox.keys = keys;

export const MenuItemCheckbox = unstable_createComponent(
  "input",
  useMenuItemCheckbox
);
