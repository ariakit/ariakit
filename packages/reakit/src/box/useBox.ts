import * as React from "react";
import useHook from "../theme/useHook";

export type UseBoxOptions = {
  /** Options passed to `reakit-theme-*` */
  theme?: any;
};

export type UseBoxProps = React.HTMLAttributes<any> & React.RefAttributes<any>;

export function useBox(options: UseBoxOptions = {}, props: UseBoxProps = {}) {
  props = useHook("useBox", options, props);
  return props;
}

useBox.keys = ["theme"] as Array<keyof UseBoxOptions>;

export default useBox;
