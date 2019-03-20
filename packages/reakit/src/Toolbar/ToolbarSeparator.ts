import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import {
  unstable_SeparatorOptions,
  unstable_SeparatorProps,
  useSeparator
} from "../Separator/Separator";

import { unstable_ToolbarStateReturn, useToolbarState } from "./ToolbarState";

export type unstable_ToolbarSeparatorOptions = unstable_SeparatorOptions &
  Partial<unstable_ToolbarStateReturn>;

export type unstable_ToolbarSeparatorProps = unstable_SeparatorProps;

export function useToolbarSeparator(
  options: unstable_ToolbarSeparatorOptions,
  htmlProps: unstable_ToolbarSeparatorProps = {}
) {
  htmlProps = useSeparator(options, htmlProps);
  htmlProps = useHook("useToolbarSeparator", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_ToolbarSeparatorOptions> = [
  ...useSeparator.keys,
  ...useToolbarState.keys
];

useToolbarSeparator.keys = keys;

export const ToolbarSeparator = unstable_createComponent(
  "hr",
  useToolbarSeparator
);
