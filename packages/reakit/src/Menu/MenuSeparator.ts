import { unstable_createComponent } from "../utils/createComponent";
import {
  SeparatorOptions,
  SeparatorHTMLProps,
  useSeparator
} from "../Separator/Separator";
import { unstable_createHook } from "../utils/createHook";
import { useMenuState } from "./MenuState";

export type MenuSeparatorOptions = SeparatorOptions;

export type MenuSeparatorHTMLProps = SeparatorHTMLProps;

export type MenuSeparatorProps = MenuSeparatorOptions & MenuSeparatorHTMLProps;

export const useMenuSeparator = unstable_createHook<
  MenuSeparatorOptions,
  MenuSeparatorHTMLProps
>({
  name: "MenuSeparator",
  compose: useSeparator,
  useState: useMenuState
});

export const MenuSeparator = unstable_createComponent({
  as: "hr",
  useHook: useMenuSeparator
});
