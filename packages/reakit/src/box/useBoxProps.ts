import { useThemeProps } from "../theme";
import { useProps } from "../utils";

export type UseBoxOptions = {
  theme?: any;
};

export function useBoxProps(options: UseBoxOptions = {}) {
  const boxProps = useThemeProps("useBoxProps", options);
  return useProps(options, boxProps);
}

export default useBoxProps;
