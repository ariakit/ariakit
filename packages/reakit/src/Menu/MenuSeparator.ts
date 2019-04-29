import { unstable_createComponent } from "../utils/createComponent";
import {
  SeparatorOptions,
  SeparatorProps,
  useSeparator
} from "../Separator/Separator";
import { unstable_createHook } from "../utils/createHook";
import { useMenuState } from "./MenuState";

export type MenuSeparatorOptions = SeparatorOptions;

export type MenuSeparatorProps = SeparatorProps;

export const useMenuSeparator = unstable_createHook<
  MenuSeparatorOptions,
  MenuSeparatorProps
>({
  name: "MenuSeparator",
  compose: useSeparator,
  useState: useMenuState
});

export const MenuSeparator = unstable_createComponent({
  as: "hr",
  useHook: useMenuSeparator
});
