import { unstable_UseBoxProps } from "reakit/box/useBox";
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
  htmlProps: unstable_UseBoxProps = {}
) {
  const color = usePalette(system.color);
  const bgColor = usePalette(system.bgColor);
  const style = {
    ...(color ? { color } : {}),
    ...(bgColor ? { backgroundColor: bgColor } : {})
  };
  return mergeProps({ style }, htmlProps);
}
