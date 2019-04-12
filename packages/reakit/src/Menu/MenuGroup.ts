import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { Keys } from "../__utils/types";
import { useMenuState, MenuStateReturn } from "./MenuState";

export type MenuGroupOptions = BoxOptions;

export type MenuGroupProps = BoxProps & React.FieldsetHTMLAttributes<any>;

export function useMenuGroup(
  options: MenuGroupOptions,
  htmlProps: MenuGroupProps = {}
) {
  options = unstable_useOptions("useMenuGroup", options, htmlProps);
  htmlProps = mergeProps({ role: "group" } as typeof htmlProps, htmlProps);
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useProps("useMenuGroup", options, htmlProps);
  return htmlProps;
}

const keys: Keys<MenuStateReturn & MenuGroupOptions> = [
  ...useBox.__keys,
  ...useMenuState.__keys
];

useMenuGroup.__keys = keys;

export const MenuGroup = unstable_createComponent({
  as: "fieldset",
  useHook: useMenuGroup
});
