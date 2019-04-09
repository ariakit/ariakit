import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  SeparatorOptions,
  SeparatorProps,
  useSeparator
} from "../Separator/Separator";
import { Keys } from "../__utils/types";
import { useToolbarState, ToolbarStateReturn } from "./ToolbarState";

export type ToolbarSeparatorOptions = SeparatorOptions &
  Partial<ToolbarStateReturn>;

export type ToolbarSeparatorProps = SeparatorProps;

export function useToolbarSeparator(
  options: ToolbarSeparatorOptions,
  htmlProps: ToolbarSeparatorProps = {}
) {
  options = unstable_useOptions("useToolbarSeparator", options, htmlProps);
  htmlProps = useSeparator(options, htmlProps);
  htmlProps = unstable_useProps("useToolbarSeparator", options, htmlProps);
  return htmlProps;
}

const keys: Keys<ToolbarSeparatorOptions> = [
  ...useSeparator.__keys,
  ...useToolbarState.__keys
];

useToolbarSeparator.__keys = keys;

export const ToolbarSeparator = unstable_createComponent({
  as: "hr",
  useHook: useToolbarSeparator
});
