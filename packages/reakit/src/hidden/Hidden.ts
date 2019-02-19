import * as React from "react";
import forwardRef from "../_utils/forwardRef";
import { As, ComponentPropsWithAs } from "../_utils/types";
import useHiddenProps, { HiddenOptions } from "./useHiddenProps";
import { useCreateElement } from "../utils";

export type HiddenProps<T extends As> = HiddenOptions & ComponentPropsWithAs<T>;

export const Hidden = forwardRef(
  <T extends As = "div">(
    {
      as = "div" as T,
      theme,
      visible,
      hide,
      hideOnEsc,
      hideOnClickOutside,
      ...props
    }: HiddenProps<T>,
    ref: React.Ref<any>
  ) => {
    props = { as, ref, ...props };
    props = useHiddenProps(
      { theme, visible, hide, hideOnEsc, hideOnClickOutside },
      props
    ) as typeof props;
    return useCreateElement(props);
  }
);

export default Hidden;
