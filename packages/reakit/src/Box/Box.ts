import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";

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

export const useBox = createHook<BoxOptions, BoxHTMLProps>({
  name: "Box",
  keys: ["unstable_system"]
});

export const Box = createComponent({
  as: "div",
  useHook: useBox
});
