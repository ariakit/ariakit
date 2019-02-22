import * as React from "react";
import { As, PropsWithAs } from "../_utils/types";
import forwardRef from "../_utils/forwardRef";
import splitProps from "../utils/splitProps";
import useCreateElement from "../utils/useCreateElement";
import useTab, { UseTabOptions } from "./useTab";

export type TabProps<T extends As> = PropsWithAs<UseTabOptions, T>;

export const Tab = forwardRef(
  <T extends As = "li">(
    { as = "li" as T, ...props }: TabProps<T>,
    ref: React.Ref<any>
  ) => {
    const [options, htmlProps] = splitProps(props, useTab.keys);
    const stepProps = useTab(options, { ref, ...htmlProps });
    return useCreateElement(as, stepProps);
  }
);

export default Tab;
