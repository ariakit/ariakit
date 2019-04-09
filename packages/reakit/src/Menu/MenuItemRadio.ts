import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  unstable_RadioOptions,
  unstable_RadioProps,
  unstable_useRadio
} from "../Radio/Radio";
import { Keys } from "../__utils/types";
import { useMenuState, unstable_MenuStateReturn } from "./MenuState";
import {
  useMenuItem,
  unstable_MenuItemOptions,
  unstable_MenuItemProps
} from "./MenuItem";

export type unstable_MenuItemRadioOptions = unstable_RadioOptions &
  unstable_MenuItemOptions &
  Partial<unstable_MenuStateReturn> &
  Pick<unstable_MenuStateReturn, "unstable_values" | "unstable_update"> & {
    /** TODO: Description */
    name: string;
  };

export type unstable_MenuItemRadioProps = unstable_RadioProps &
  unstable_MenuItemProps;

export function unstable_useMenuItemRadio(
  options: unstable_MenuItemRadioOptions,
  htmlProps: unstable_MenuItemRadioProps = {}
) {
  options = unstable_useOptions("useMenuItemRadio", options, htmlProps);

  const currentValue = options.unstable_values[options.name];
  const setValue = (value: any) => options.unstable_update(options.name, value);

  htmlProps = mergeProps(
    { role: "menuitemradio" } as typeof htmlProps,
    htmlProps
  );
  htmlProps = unstable_useRadio(
    { ...options, currentValue, setValue },
    htmlProps
  );
  htmlProps = useMenuItem(options, htmlProps);
  htmlProps = unstable_useProps("useMenuItemRadio", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_MenuItemRadioOptions> = [
  ...unstable_useRadio.__keys,
  ...useMenuState.__keys,
  "name"
];

unstable_useMenuItemRadio.__keys = keys;

export const unstable_MenuItemRadio = unstable_createComponent({
  as: "button",
  useHook: unstable_useMenuItemRadio
});
