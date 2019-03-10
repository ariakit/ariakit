import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_RovingOptions,
  unstable_RovingProps,
  useRoving
} from "../Roving/Roving";
import { unstable_ToolbarStateReturn, useToolbarState } from "./ToolbarState";

export type unstable_ToolbarButtonOptions = unstable_RovingOptions &
  Partial<unstable_ToolbarStateReturn>;

export type unstable_ToolbarButtonProps = unstable_RovingProps &
  React.LiHTMLAttributes<any>;

export function useToolbarButton(
  options: unstable_ToolbarButtonOptions,
  htmlProps: unstable_ToolbarButtonProps = {}
) {
  htmlProps = useRoving(options, htmlProps);
  htmlProps = unstable_useHook("useToolbarButton", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_ToolbarButtonOptions> = [
  ...useRoving.keys,
  ...useToolbarState.keys
];

useToolbarButton.keys = keys;

export const ToolbarButton = unstable_createComponent(
  "button",
  useToolbarButton
);
