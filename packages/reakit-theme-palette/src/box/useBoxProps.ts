import { mergeProps, UseBoxProps } from "reakit";
import usePalette from "../utils/usePalette";

export type UseBoxOptions = {
  theme: {
    color?: string;
    bgColor?: string;
  };
};

export function useBox({ theme = {} }: UseBoxOptions, props: UseBoxProps = {}) {
  const color = usePalette(theme.color);
  const bgColor = usePalette(theme.bgColor);
  const style = {
    ...(color ? { color } : {}),
    ...(bgColor ? { backgroundColor: bgColor } : {})
  };
  return mergeProps({ style }, props);
}

export default useBox;
