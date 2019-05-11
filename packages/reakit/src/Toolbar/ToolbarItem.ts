import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { RoverOptions, RoverHTMLProps, useRover } from "../Rover/Rover";
import { unstable_createHook } from "../utils/createHook";
import { useToolbarState } from "./ToolbarState";

export type ToolbarItemOptions = RoverOptions;

export type ToolbarItemHTMLProps = RoverHTMLProps & React.LiHTMLAttributes<any>;

export type ToolbarItemProps = ToolbarItemOptions & ToolbarItemHTMLProps;

export const useToolbarItem = unstable_createHook<
  ToolbarItemOptions,
  ToolbarItemHTMLProps
>({
  name: "ToolbarItem",
  compose: useRover,
  useState: useToolbarState
});

export const ToolbarItem = unstable_createComponent({
  as: "button",
  useHook: useToolbarItem
});
