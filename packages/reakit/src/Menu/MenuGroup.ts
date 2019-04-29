import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";
import { useMenuState } from "./MenuState";

export type MenuGroupOptions = BoxOptions;

export type MenuGroupProps = BoxProps;

export const useMenuGroup = unstable_createHook<
  MenuGroupOptions,
  MenuGroupProps
>({
  name: "MenuGroup",
  compose: useBox,
  useState: useMenuState,

  useProps(_, htmlProps) {
    return mergeProps({ role: "group" } as MenuGroupProps, htmlProps);
  }
});

export const MenuGroup = unstable_createComponent({
  as: "div",
  useHook: useMenuGroup
});
