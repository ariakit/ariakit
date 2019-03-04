import * as React from "react";
import { unstable_useHook } from "../system/useHook";

export type unstable_UseBoxOptions = {
  /** Options passed to `reakit-system-*` */
  system?: any;
};

export type unstable_UseBoxProps = React.HTMLAttributes<any> &
  React.RefAttributes<any>;

export function useBox(
  options: unstable_UseBoxOptions = {},
  htmlProps: unstable_UseBoxProps = {}
) {
  htmlProps = unstable_useHook("useBox", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_UseBoxOptions> = ["system"];

useBox.keys = keys;
