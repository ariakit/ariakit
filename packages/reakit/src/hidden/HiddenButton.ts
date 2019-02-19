import * as React from "react";
import forwardRef from "../_utils/forwardRef";
import { As, ComponentPropsWithAs } from "../_utils/types";
import useHiddenButtonProps, {
  HiddenButtonOptions
} from "./useHiddenButtonProps";
import { useCreateElement } from "../utils";

export type HiddenButtonProps<T extends As> = HiddenButtonOptions &
  ComponentPropsWithAs<T>;

export const HiddenButton = forwardRef(
  <T extends As = "button">(
    { as = "button" as T, theme, toggle, ...props }: HiddenButtonProps<T>,
    ref: React.Ref<any>
  ) => {
    props = { as, ref, ...props };
    props = useHiddenButtonProps({ theme, toggle }, props) as typeof props;
    return useCreateElement(props);
  }
);

export default HiddenButton;
