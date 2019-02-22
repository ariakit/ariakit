import * as React from "react";
import forwardRef from "../_utils/forwardRef";
import { As, PropsWithAs } from "../_utils/types";
import useHidden, { UseHiddenOptions } from "./useHidden";
import { useCreateElement } from "../utils";
import splitHiddenProps from "./splitHiddenProps";

export type HiddenProps<T extends As> = PropsWithAs<UseHiddenOptions, T>;

export const Hidden = forwardRef(
  <T extends As = "div">(
    { as = "div" as T, ...props }: HiddenProps<T>,
    ref: React.Ref<any>
  ) => {
    const [options, htmlProps] = splitHiddenProps(props);
    const hiddenProps = useHidden(options, { ref, ...htmlProps });
    return useCreateElement(as, hiddenProps);
  }
);

export default Hidden;
