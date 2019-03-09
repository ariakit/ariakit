import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { unstable_ToolbarStateReturn, useToolbarState } from "./ToolbarState";

export type unstable_ToolbarOptions = unstable_BoxOptions &
  Partial<unstable_ToolbarStateReturn>;

export type unstable_ToolbarProps = unstable_BoxProps;

export function useToolbar(
  options: unstable_ToolbarOptions,
  htmlProps: unstable_ToolbarProps = {}
) {
  htmlProps = mergeProps(
    {
      role: "toolbar",
      "aria-orientation": options.orientation
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useHook("useToolbar", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_ToolbarOptions> = [
  ...useBox.keys,
  ...useToolbarState.keys
];

useToolbar.keys = keys;

export const Toolbar = unstable_createComponent("ul", useToolbar);
