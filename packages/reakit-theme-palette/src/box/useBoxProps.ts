import * as React from "react";
import { mergeProps } from "reakit";
import usePalette from "../utils/usePalette";

export type UseBoxPropsOptions = {
  theme: {
    color?: string;
    bgColor?: string;
  };
};

export function useBoxProps(
  { theme }: UseBoxPropsOptions,
  props: React.HTMLAttributes<any> & React.RefAttributes<any> = {}
) {
  const color = usePalette(theme.color);
  const bgColor = usePalette(theme.bgColor);
  const style = {
    ...(color ? { color } : {}),
    ...(bgColor ? { backgroundColor: bgColor } : {})
  };
  return mergeProps({ style }, props);
}

export default useBoxProps;
