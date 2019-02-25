import * as React from "react";
import { unstable_useHook } from "../theme/useHook";

export type unstable_UseBoxOptions = {
  /** Options passed to `reakit-theme-*` */
  theme?: any;
};

export type unstable_UseBoxProps = React.HTMLAttributes<any> &
  React.RefAttributes<any>;

export function useBox(
  options: unstable_UseBoxOptions = {},
  props: unstable_UseBoxProps = {}
) {
  props = unstable_useHook("useBox", options, props);
  return props;
}

const keys: Array<keyof unstable_UseBoxOptions> = ["theme"];

useBox.keys = keys;
