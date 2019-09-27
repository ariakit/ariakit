import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { RoverOptions, RoverHTMLProps, useRover } from "../Rover/Rover";
import { useToolbarState } from "./ToolbarState";

export type ToolbarItemOptions = RoverOptions;

export type ToolbarItemHTMLProps = RoverHTMLProps;

export type ToolbarItemProps = ToolbarItemOptions & ToolbarItemHTMLProps;

export const useToolbarItem = createHook<
  ToolbarItemOptions,
  ToolbarItemHTMLProps
>({
  name: "ToolbarItem",
  compose: useRover,
  useState: useToolbarState
});

export const ToolbarItem = createComponent({
  as: "button",
  useHook: useToolbarItem
});
