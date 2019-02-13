import { mergeProps } from "reakit";
import usePalette from "./usePalette";

export type UseBoxPropsOptions = {
  theme: {
    color?: string;
    bgColor?: string;
  };
};

export function useBoxProps({ theme }: UseBoxPropsOptions, props: any = {}) {
  const color = usePalette(theme.color);
  const bgColor = usePalette(theme.bgColor);
  const style = {
    ...(color ? { color } : {}),
    ...(bgColor ? { backgroundColor: bgColor } : {})
  };
  return mergeProps({ style }, props);
}

export default useBoxProps;
