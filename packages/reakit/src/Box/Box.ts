import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { Keys } from "../__utils/types";

export type unstable_BoxOptions = {
  /** Options passed to `reakit-system-*` */
  unstable_system?: unknown;
};

export type unstable_BoxProps = React.HTMLAttributes<any> &
  React.RefAttributes<any>;

export function useBox(
  options: unstable_BoxOptions = {},
  htmlProps: unstable_BoxProps = {}
) {
  options = unstable_useOptions("useBox", options, htmlProps);
  htmlProps = unstable_useProps("useBox", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_BoxOptions> = ["unstable_system"];

useBox.__keys = keys;

export const Box = unstable_createComponent({
  as: "div",
  useHook: useBox
});
