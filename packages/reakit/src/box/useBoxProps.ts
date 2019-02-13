import { useThemeHook } from "../theme";
import { HTMLAttributesWithRef } from "../_utils/types";

export interface UseBoxPropsOptions {
  theme?: any;
}

export function useBoxProps<
  P extends HTMLAttributesWithRef = HTMLAttributesWithRef
>(options: UseBoxPropsOptions = {}, props = {} as P) {
  props = useThemeHook("useBoxProps", options, props);
  return props;
}

export default useBoxProps;
