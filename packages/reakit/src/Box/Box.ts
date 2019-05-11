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

export type BoxHTMLProps = React.HTMLAttributes<any> &
  React.RefAttributes<any> & {
    /**
     * Function returned by hook to wrap children.
     */
    unstable_wrap?: (children: React.ReactNode) => JSX.Element;
  };

export type BoxProps = BoxOptions & BoxHTMLProps;

export const useBox = unstable_createHook<BoxOptions, BoxHTMLProps>({
  name: "Box",
  keys: ["unstable_system"]
});

export const Box = unstable_createComponent({
  as: "div",
  useHook: useBox
});
