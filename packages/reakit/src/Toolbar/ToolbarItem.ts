import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  unstable_RoverOptions,
  unstable_RoverProps,
  useRover
} from "../Rover/Rover";
import { Keys } from "../__utils/types";
import { useToolbarState, unstable_ToolbarStateReturn } from "./ToolbarState";

export type unstable_ToolbarItemOptions = unstable_RoverOptions &
  Partial<unstable_ToolbarStateReturn>;

export type unstable_ToolbarItemProps = unstable_RoverProps &
  React.LiHTMLAttributes<any>;

export function useToolbarItem(
  options: unstable_ToolbarItemOptions,
  htmlProps: unstable_ToolbarItemProps = {}
) {
  options = unstable_useOptions("useToolbarItem", options, htmlProps);
  htmlProps = useRover(options, htmlProps);
  htmlProps = unstable_useProps("useToolbarItem", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_ToolbarItemOptions> = [
  ...useRover.__keys,
  ...useToolbarState.__keys
];

useToolbarItem.__keys = keys;

export const ToolbarItem = unstable_createComponent({
  as: "button",
  useHook: useToolbarItem
});
