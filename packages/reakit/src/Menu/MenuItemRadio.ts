import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { RadioOptions, RadioProps, useRadio } from "../Radio/Radio";
import { unstable_createHook } from "../utils/createHook";
import { MenuStateReturn, useMenuState } from "./MenuState";
import { useMenuItem, MenuItemOptions, MenuItemProps } from "./MenuItem";

export type MenuItemRadioOptions = RadioOptions &
  MenuItemOptions &
  Pick<MenuStateReturn, "unstable_values" | "unstable_update"> & {
    /**
     * MenuItemRadio's name as in `menu.values`.
     */
    name: string;
  };

export type MenuItemRadioProps = RadioProps & MenuItemProps;

export const useMenuItemRadio = unstable_createHook<
  MenuItemRadioOptions,
  MenuItemRadioProps
>({
  name: "MenuItemRadio",
  compose: [useMenuItem, useRadio],
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

  useProps(_, htmlProps) {
    return mergeProps(
      { role: "menuitemradio" } as MenuItemRadioProps,
      htmlProps
    );
  }
});

export const MenuItemRadio = unstable_createComponent({
  as: "button",
  useHook: useMenuItemRadio
});
