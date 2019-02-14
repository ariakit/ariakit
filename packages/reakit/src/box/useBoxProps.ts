import * as React from "react";
import { useThemeHook } from "../theme";

export interface UseBoxPropsOptions {
  theme?: any;
}

export function useBoxProps(
  options: UseBoxPropsOptions = {},
  props: React.HTMLAttributes<any> & React.RefAttributes<any> = {}
) {
  props = useThemeHook("useBoxProps", options, props);
  return props;
}

export default useBoxProps;
