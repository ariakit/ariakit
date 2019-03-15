import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_RoverOptions,
  unstable_RoverProps,
  useRover
} from "../Rover/Rover";
import { unstable_ToolbarStateReturn, useToolbarState } from "./ToolbarState";

export type unstable_ToolbarButtonOptions = unstable_RoverOptions &
  Partial<unstable_ToolbarStateReturn>;

export type unstable_ToolbarButtonProps = unstable_RoverProps &
  React.LiHTMLAttributes<any>;

export function useToolbarButton(
  options: unstable_ToolbarButtonOptions,
  htmlProps: unstable_ToolbarButtonProps = {}
) {
  htmlProps = useRover(options, htmlProps);
  htmlProps = unstable_useHook("useToolbarButton", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_ToolbarButtonOptions> = [
  ...useRover.keys,
  ...useToolbarState.keys
];

useToolbarButton.keys = keys;

export const ToolbarButton = unstable_createComponent(
  "button",
  useToolbarButton
);
