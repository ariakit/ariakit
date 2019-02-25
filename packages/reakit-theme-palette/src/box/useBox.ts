import { unstable_UseBoxProps } from "reakit/box/useBox";
import { mergeProps } from "reakit/utils/mergeProps";
import { usePalette } from "../utils/usePalette";

export type UseBoxOptions = {
  theme: {
    color?: string;
    bgColor?: string;
  };
};

export function useBox(
  { theme = {} }: UseBoxOptions,
  props: unstable_UseBoxProps = {}
) {
  const color = usePalette(theme.color);
  const bgColor = usePalette(theme.bgColor);
  const style = {
    ...(color ? { color } : {}),
    ...(bgColor ? { backgroundColor: bgColor } : {})
  };
  return mergeProps({ style }, props);
}
