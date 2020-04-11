import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { RadioOptions, RadioHTMLProps, useRadio } from "../Radio/Radio";
import { unstable_useId } from "../Id/Id";
import { MenuStateReturn, useMenuState } from "./MenuState";
import { useMenuItem, MenuItemOptions, MenuItemHTMLProps } from "./MenuItem";

export type MenuItemRadioOptions = RadioOptions &
  MenuItemOptions &
  Pick<MenuStateReturn, "unstable_values" | "unstable_setValue"> & {
    /**
     * MenuItemRadio's name as in `menu.values`.
     */
    name: string;
  };

export type MenuItemRadioHTMLProps = RadioHTMLProps & MenuItemHTMLProps;

export type MenuItemRadioProps = MenuItemRadioOptions & MenuItemRadioHTMLProps;

export const useMenuItemRadio = createHook<
  MenuItemRadioOptions,
  MenuItemRadioHTMLProps
>({
  name: "MenuItemRadio",
  compose: [useMenuItem, useRadio],
  useState: useMenuState,
  keys: ["name"],

  propsAreEqual(prev, next) {
    return useMenuItem.__propsAreEqual?.(prev, next);
  },

  useOptions(options) {
    const setState = React.useCallback(
      (value) => options.unstable_setValue(options.name, value),
      [options.unstable_setValue, options.name]
    );
    return {
      ...options,
      unstable_checkOnFocus: false,
      state: options.unstable_values[options.name],
      setState,
    };
  },

  useProps(_, htmlProps) {
    return { role: "menuitemradio", ...htmlProps };
  },
});

const MenuItemRadioWithoutId = createComponent({
  as: "button",
  useHook: useMenuItemRadio,
});

export const MenuItemRadio = createComponent({
  as: "button",
  useCreateElement(type, props) {
    const { id } = unstable_useId(props);
    return <MenuItemRadioWithoutId as={type} id={id} {...props} />;
  },
});
