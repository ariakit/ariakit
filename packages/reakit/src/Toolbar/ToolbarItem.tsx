import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { unstable_ToolbarStateReturn, useToolbarState } from "./ToolbarState";

export type unstable_ToolbarItemOptions = unstable_BoxOptions &
  Partial<unstable_ToolbarStateReturn>;

export type unstable_ToolbarItemProps = unstable_BoxProps &
  React.LiHTMLAttributes<any>;

export function useToolbarItem(
  options: unstable_ToolbarItemOptions = {},
  htmlProps: unstable_ToolbarItemProps = {}
) {
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useHook("useToolbarItem", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_ToolbarItemOptions> = [
  ...useBox.keys,
  ...useToolbarState.keys
];

useToolbarItem.keys = keys;

export const ToolbarItem = unstable_createComponent("li", useToolbarItem);
