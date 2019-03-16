import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { unstable_ToolbarStateReturn, useToolbarState } from "./ToolbarState";

export type unstable_ToolbarSeparatorOptions = unstable_BoxOptions &
  Partial<unstable_ToolbarStateReturn>;

export type unstable_ToolbarSeparatorProps = unstable_BoxProps;

export function useToolbarSeparator(
  options: unstable_ToolbarSeparatorOptions,
  htmlProps: unstable_ToolbarSeparatorProps = {}
) {
  const flipMap = {
    horizontal: "vertical",
    vertical: "horizontal"
  };
  const orientation = options.orientation
    ? flipMap[options.orientation]
    : undefined;

  htmlProps = mergeProps(
    {
      role: "separator",
      "aria-orientation": orientation
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = useHook("useToolbarSeparator", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_ToolbarSeparatorOptions> = [
  ...useBox.keys,
  ...useToolbarState.keys
];

useToolbarSeparator.keys = keys;

export const ToolbarSeparator = unstable_createComponent(
  "hr",
  useToolbarSeparator
);
