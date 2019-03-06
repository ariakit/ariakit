import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";

export type unstable_BoxOptions = {
  /** Options passed to `reakit-system-*` */
  system?: any;
};

export type unstable_BoxProps = React.HTMLAttributes<any> &
  React.RefAttributes<any>;

export function useBox(
  options: unstable_BoxOptions = {},
  htmlProps: unstable_BoxProps = {}
) {
  htmlProps = unstable_useHook("useBox", options, htmlProps);
  return htmlProps;
}

useBox.keys = ["system"] as Array<keyof unstable_BoxOptions>;

export const Box = unstable_createComponent("div", useBox);
