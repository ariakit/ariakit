import { unstable_createComponent } from "../utils/createComponent";
import {
  SeparatorOptions,
  SeparatorHTMLProps,
  useSeparator
} from "../Separator/Separator";
import { unstable_createHook } from "../utils/createHook";
import { useToolbarState } from "./ToolbarState";

export type ToolbarSeparatorOptions = SeparatorOptions;

export type ToolbarSeparatorHTMLProps = SeparatorHTMLProps;

export type ToolbarSeparatorProps = ToolbarSeparatorOptions &
  ToolbarSeparatorHTMLProps;

export const useToolbarSeparator = unstable_createHook<
  ToolbarSeparatorOptions,
  ToolbarSeparatorHTMLProps
>({
  name: "ToolbarSeparator",
  compose: useSeparator,
  useState: useToolbarState
});

export const ToolbarSeparator = unstable_createComponent({
  as: "hr",
  useHook: useToolbarSeparator
});
