import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { RoverOptions, RoverProps, useRover } from "../Rover/Rover";
import { Keys } from "../__utils/types";
import { useToolbarState, ToolbarStateReturn } from "./ToolbarState";

export type ToolbarItemOptions = RoverOptions;

export type ToolbarItemProps = RoverProps & React.LiHTMLAttributes<any>;

export function useToolbarItem(
  options: ToolbarItemOptions,
  htmlProps: ToolbarItemProps = {}
) {
  options = unstable_useOptions("useToolbarItem", options, htmlProps);
  htmlProps = useRover(options, htmlProps);
  htmlProps = unstable_useProps("useToolbarItem", options, htmlProps);
  return htmlProps;
}

const keys: Keys<ToolbarStateReturn & ToolbarItemOptions> = [
  ...useRover.__keys,
  ...useToolbarState.__keys
];

useToolbarItem.__keys = keys;

export const ToolbarItem = unstable_createComponent({
  as: "button",
  useHook: useToolbarItem
});
