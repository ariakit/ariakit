import { unstable_BoxProps } from "reakit/Box/Box";
import { mergeProps } from "reakit/utils/mergeProps";

import { usePalette } from "../utils/usePalette";

export type UseBoxOptions = {
  system: {
    color?: string;
    bgColor?: string;
  };
};

export function useBox(
  { system = {} }: UseBoxOptions,
  htmlProps: unstable_BoxProps = {}
) {
  const color = usePalette(system.color);
  const bgColor = usePalette(system.bgColor);
  const style = {
    ...(color ? { color } : {}),
    ...(bgColor ? { backgroundColor: bgColor } : {})
  };
  return mergeProps({ style }, htmlProps);
}
