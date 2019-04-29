import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { RoverOptions, RoverProps, useRover } from "../Rover/Rover";
import { unstable_createHook } from "../utils/createHook";
import { useToolbarState } from "./ToolbarState";

export type ToolbarItemOptions = RoverOptions;

export type ToolbarItemProps = RoverProps & React.LiHTMLAttributes<any>;

export const useToolbarItem = unstable_createHook<
  ToolbarItemOptions,
  ToolbarItemProps
>({
  name: "ToolbarItem",
  compose: useRover,
  useState: useToolbarState
});

export const ToolbarItem = unstable_createComponent({
  as: "button",
  useHook: useToolbarItem
});
