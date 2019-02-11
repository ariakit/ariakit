import { useThemeProps } from "../theme";
import { HTMLAtttributesWithRef } from "../_utils/types";

export function useProps<P extends React.HTMLAttributes<any>>(
  options: any,
  props?: P
) {
  return useThemeProps("useProps", options, props);
}

export default useProps;
