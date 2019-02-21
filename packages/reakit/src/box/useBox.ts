import * as React from "react";
import { useHook } from "../theme";

export type UseBoxOptions = {
  /** Options passed to `reakit-theme-*` */
  theme?: any;
};

export type UseBoxProps = React.HTMLAttributes<any> & React.RefAttributes<any>;

export function useBox(options: UseBoxOptions = {}, props: UseBoxProps = {}) {
  props = useHook("useBox", options, props);
  return props;
}

export default useBox;
