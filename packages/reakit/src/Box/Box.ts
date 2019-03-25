import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import { Keys } from "../__utils/types";

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
  htmlProps = useHook("useBox", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_BoxOptions> = ["system"];

useBox.__keys = keys;

export const Box = unstable_createComponent({
  as: "div",
  useHook: useBox
});
