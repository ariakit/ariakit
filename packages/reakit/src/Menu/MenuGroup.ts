import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { useMenuState, unstable_MenuStateReturn } from "./MenuState";

export type unstable_MenuGroupOptions = unstable_BoxOptions &
  Partial<unstable_MenuStateReturn>;

export type unstable_MenuGroupProps = unstable_BoxProps &
  React.FieldsetHTMLAttributes<any>;

export function useMenuGroup(
  options: unstable_MenuGroupOptions,
  htmlProps: unstable_MenuGroupProps = {}
) {
  htmlProps = mergeProps(
    {
      role: "menuitemradio"
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useBox(options, htmlProps);
  htmlProps = useHook("useMenuGroup", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_MenuGroupOptions> = [
  ...useBox.keys,
  ...useMenuState.keys
];

useMenuGroup.keys = keys;

export const MenuGroup = unstable_createComponent("fieldset", useMenuGroup);
