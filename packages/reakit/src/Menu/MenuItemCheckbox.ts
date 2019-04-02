import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { unstable_CheckboxOptions, useCheckbox } from "../Checkbox/Checkbox";
import { Keys } from "../__utils/types";
import {
  unstable_MenuItemOptions,
  unstable_MenuItemProps,
  useMenuItem
} from "./MenuItem";
import { useMenuState, unstable_MenuStateReturn } from "./MenuState";

export type unstable_MenuItemCheckboxOptions = unstable_CheckboxOptions &
  unstable_MenuItemOptions &
  Partial<unstable_MenuStateReturn> &
  Pick<unstable_MenuStateReturn, "unstable_values" | "unstable_update"> & {
    /** TODO: Description */
    name: string;
  };

export type unstable_MenuItemCheckboxProps = unstable_MenuItemProps &
  React.InputHTMLAttributes<any>;

export function unstable_useMenuItemCheckbox(
  options: unstable_MenuItemCheckboxOptions,
  htmlProps: unstable_MenuItemCheckboxProps = {}
) {
  options = unstable_useOptions("useMenuItemCheckbox", options, htmlProps);

  const currentValue = options.unstable_values[options.name];
  const setValue = (value: any) => options.unstable_update(options.name, value);

  htmlProps = mergeProps(
    {
      role: "menuitemcheckbox",
      name: options.name
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useCheckbox({ ...options, currentValue, setValue }, htmlProps);
  htmlProps = useMenuItem(options, htmlProps);
  htmlProps = unstable_useProps("useMenuItemCheckbox", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_MenuItemCheckboxOptions> = [
  ...useCheckbox.__keys,
  ...useMenuItem.__keys,
  ...useMenuState.__keys,
  "name"
];

unstable_useMenuItemCheckbox.__keys = keys;

export const unstable_MenuItemCheckbox = unstable_createComponent({
  as: "input",
  useHook: unstable_useMenuItemCheckbox
});
