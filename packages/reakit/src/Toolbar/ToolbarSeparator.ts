import { createComponent } from "reakit-utils/createComponent";
import { createHook } from "reakit-utils/createHook";
import {
  SeparatorOptions,
  SeparatorHTMLProps,
  useSeparator
} from "../Separator/Separator";
import { useToolbarState } from "./ToolbarState";

export type ToolbarSeparatorOptions = SeparatorOptions;

export type ToolbarSeparatorHTMLProps = SeparatorHTMLProps;

export type ToolbarSeparatorProps = ToolbarSeparatorOptions &
  ToolbarSeparatorHTMLProps;

export const useToolbarSeparator = createHook<
  ToolbarSeparatorOptions,
  ToolbarSeparatorHTMLProps
>({
  name: "ToolbarSeparator",
  compose: useSeparator,
  useState: useToolbarState,

  useOptions({ orientation = "vertical", ...options }) {
    return {
      orientation: orientation === "vertical" ? "horizontal" : "vertical",
      ...options
    };
  }
});

export const ToolbarSeparator = createComponent({
  as: "hr",
  useHook: useToolbarSeparator
});
