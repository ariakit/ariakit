import { unstable_createComponent } from "../utils/createComponent";
import {
  SeparatorOptions,
  SeparatorProps,
  useSeparator
} from "../Separator/Separator";
import { unstable_createHook } from "../utils/createHook";
import { useToolbarState } from "./ToolbarState";

export type ToolbarSeparatorOptions = SeparatorOptions;

export type ToolbarSeparatorProps = SeparatorProps;

export const useToolbarSeparator = unstable_createHook<
  ToolbarSeparatorOptions,
  ToolbarSeparatorProps
>({
  name: "ToolbarSeparator",
  compose: useSeparator,
  useState: useToolbarState
});

export const ToolbarSeparator = unstable_createComponent({
  as: "hr",
  useHook: useToolbarSeparator
});
