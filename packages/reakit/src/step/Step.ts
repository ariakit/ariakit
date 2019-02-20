import * as React from "react";
import forwardRef from "../_utils/forwardRef";
import { As, PropsWithAs } from "../_utils/types";
import useHidden, { UseHiddenOptions } from "./useStep";
import { useCreateElement } from "../utils";

export type HiddenProps<T extends As> = PropsWithAs<UseHiddenOptions, T>;

export const Hidden = forwardRef(
  <T extends As = "div">(
    { as = "div" as T, ...props }: HiddenProps<T>,
    ref: React.Ref<any>
  ) => {
    const hiddenProps = useHidden(props, { ref, ...props });
    return useCreateElement(as, hiddenProps);
  }
);

export default Hidden;
