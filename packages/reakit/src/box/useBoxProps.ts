import { useThemeHook } from "../theme";
import { HTMLAttributesWithRef } from "../_utils/types";

export type UseBoxOptions = {
  theme?: any;
};

export function useBoxProps<
  P extends HTMLAttributesWithRef = HTMLAttributesWithRef
>(options: UseBoxOptions = {}, props = {} as P) {
  props = useThemeHook("useBoxProps", options, props);
  return props;
}

export default useBoxProps;
