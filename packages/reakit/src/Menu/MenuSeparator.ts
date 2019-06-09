import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import {
  SeparatorOptions,
  SeparatorHTMLProps,
  useSeparator
} from "../Separator/Separator";
import { useMenuState } from "./MenuState";

export type MenuSeparatorOptions = SeparatorOptions;

export type MenuSeparatorHTMLProps = SeparatorHTMLProps;

export type MenuSeparatorProps = MenuSeparatorOptions & MenuSeparatorHTMLProps;

export const useMenuSeparator = createHook<
  MenuSeparatorOptions,
  MenuSeparatorHTMLProps
>({
  name: "MenuSeparator",
  compose: useSeparator,
  useState: useMenuState,

  useOptions({ orientation = "vertical", ...options }) {
    return {
      orientation: orientation === "vertical" ? "horizontal" : "vertical",
      ...options
    };
  }
});

export const MenuSeparator = createComponent({
  as: "hr",
  useHook: useMenuSeparator
});
