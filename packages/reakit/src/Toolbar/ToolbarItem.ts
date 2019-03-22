import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import {
  unstable_RoverOptions,
  unstable_RoverProps,
  useRover
} from "../Rover/Rover";
import { unstable_ToolbarStateReturn, useToolbarState } from "./ToolbarState";

export type unstable_ToolbarItemOptions = unstable_RoverOptions &
  Partial<unstable_ToolbarStateReturn>;

export type unstable_ToolbarItemProps = unstable_RoverProps &
  React.LiHTMLAttributes<any>;

export function useToolbarItem(
  options: unstable_ToolbarItemOptions,
  htmlProps: unstable_ToolbarItemProps = {}
) {
  htmlProps = useRover(options, htmlProps);
  htmlProps = useHook("useToolbarItem", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_ToolbarItemOptions> = [
  ...useRover.keys,
  ...useToolbarState.keys
];

useToolbarItem.keys = keys;

export const ToolbarItem = unstable_createComponent("button", useToolbarItem);
