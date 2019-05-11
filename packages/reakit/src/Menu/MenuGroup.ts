import { unstable_mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";
import { useMenuState } from "./MenuState";

export type MenuGroupOptions = BoxOptions;

export type MenuGroupHTMLProps = BoxHTMLProps;

export type MenuGroupProps = MenuGroupOptions & MenuGroupHTMLProps;

export const useMenuGroup = unstable_createHook<
  MenuGroupOptions,
  MenuGroupHTMLProps
>({
  name: "MenuGroup",
  compose: useBox,
  useState: useMenuState,

  useProps(_, htmlProps) {
    return unstable_mergeProps(
      { role: "group" } as MenuGroupHTMLProps,
      htmlProps
    );
  }
});

export const MenuGroup = unstable_createComponent({
  as: "div",
  useHook: useMenuGroup
});
