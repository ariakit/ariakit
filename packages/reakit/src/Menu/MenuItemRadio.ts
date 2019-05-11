import * as React from "react";
import { unstable_mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { RadioOptions, RadioHTMLProps, useRadio } from "../Radio/Radio";
import { unstable_createHook } from "../utils/createHook";
import { MenuStateReturn, useMenuState } from "./MenuState";
import { useMenuItem, MenuItemOptions, MenuItemHTMLProps } from "./MenuItem";

export type MenuItemRadioOptions = RadioOptions &
  MenuItemOptions &
  Pick<MenuStateReturn, "unstable_values" | "unstable_update"> & {
    /**
     * MenuItemRadio's name as in `menu.values`.
     */
    name: string;
  };

export type MenuItemRadioHTMLProps = RadioHTMLProps & MenuItemHTMLProps;

export type MenuItemRadioProps = MenuItemRadioOptions & MenuItemRadioHTMLProps;

export const useMenuItemRadio = unstable_createHook<
  MenuItemRadioOptions,
  MenuItemRadioHTMLProps
>({
  name: "MenuItemRadio",
  compose: [useMenuItem, useRadio],
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

  useProps(_, htmlProps) {
    return unstable_mergeProps(
      { role: "menuitemradio" } as MenuItemRadioHTMLProps,
      htmlProps
    );
  }
});

export const MenuItemRadio = unstable_createComponent({
  as: "button",
  useHook: useMenuItemRadio
});
