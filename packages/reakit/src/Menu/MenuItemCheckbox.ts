import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  CheckboxOptions,
  useCheckbox,
  CheckboxProps
} from "../Checkbox/Checkbox";
import { Keys } from "../__utils/types";
import { MenuItemOptions, MenuItemProps, useMenuItem } from "./MenuItem";
import { MenuStateReturn } from "./MenuState";

export type MenuItemCheckboxOptions = CheckboxOptions &
  MenuItemOptions &
  Pick<MenuStateReturn, "unstable_values" | "unstable_update"> & {
    /** TODO: Description */
    name: string;
  };

export type MenuItemCheckboxProps = CheckboxProps & MenuItemProps;

export function useMenuItemCheckbox(
  options: MenuItemCheckboxOptions,
  htmlProps: MenuItemCheckboxProps = {}
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

const keys: Keys<MenuStateReturn & MenuItemCheckboxOptions> = [
  ...useCheckbox.__keys,
  ...useMenuItem.__keys,
  "name"
];

useMenuItemCheckbox.__keys = keys;

export const MenuItemCheckbox = unstable_createComponent({
  as: "button",
  useHook: useMenuItemCheckbox
});
