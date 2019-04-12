import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { RadioOptions, RadioProps, useRadio } from "../Radio/Radio";
import { Keys } from "../__utils/types";
import { MenuStateReturn } from "./MenuState";
import { useMenuItem, MenuItemOptions, MenuItemProps } from "./MenuItem";

export type MenuItemRadioOptions = RadioOptions &
  MenuItemOptions &
  Pick<MenuStateReturn, "unstable_values" | "unstable_update"> & {
    /** TODO: Description */
    name: string;
  };

export type MenuItemRadioProps = RadioProps & MenuItemProps;

export function useMenuItemRadio(
  options: MenuItemRadioOptions,
  htmlProps: MenuItemRadioProps = {}
) {
  options = unstable_useOptions("useMenuItemRadio", options, htmlProps);

  const currentValue = options.unstable_values[options.name];
  const setValue = (value: any) => options.unstable_update(options.name, value);

  htmlProps = mergeProps(
    { role: "menuitemradio" } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useRadio({ ...options, currentValue, setValue }, htmlProps);
  htmlProps = useMenuItem(options, htmlProps);
  htmlProps = unstable_useProps("useMenuItemRadio", options, htmlProps);
  return htmlProps;
}

const keys: Keys<MenuStateReturn & MenuItemRadioOptions> = [
  ...useRadio.__keys,
  ...useMenuItem.__keys,
  "name"
];

useMenuItemRadio.__keys = keys;

export const MenuItemRadio = unstable_createComponent({
  as: "button",
  useHook: useMenuItemRadio
});
