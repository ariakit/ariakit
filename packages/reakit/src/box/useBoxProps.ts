import * as React from "react";
import { useThemeHook } from "../theme";

export type BoxOptions = {
  /**
   * Options passed to `reakit-theme-*`
   */
  theme?: Record<string, any>;
};

export type BoxAttributes = React.HTMLAttributes<any> &
  React.RefAttributes<any>;

export function useBoxProps(
  options: BoxOptions = {},
  props: BoxAttributes = {}
) {
  props = useThemeHook("useBoxProps", options, props);
  return props;
}

export default useBoxProps;
