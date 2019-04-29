import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_createHook } from "../utils/createHook";

export type BoxOptions = {
  /**
   * Options passed to `reakit-system-*`
   * @private
   */
  unstable_system?: unknown;
};

export type BoxProps = React.HTMLAttributes<any> &
  React.RefAttributes<any> & {
    /**
     * Function returned by hook to wrap children.
     */
    unstable_wrap?: (children: React.ReactNode) => JSX.Element;
  };

export const useBox = unstable_createHook<BoxOptions, BoxProps>({
  name: "Box",
  keys: ["unstable_system"]
});

export const Box = unstable_createComponent({
  as: "div",
  useHook: useBox
});
