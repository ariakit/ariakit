import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { usePopoverState, unstable_PopoverStateReturn } from "./PopoverState";

export type unstable_PopoverArrowOptions = unstable_BoxOptions &
  Partial<unstable_PopoverStateReturn> &
  Pick<unstable_PopoverStateReturn, "placement">;

export type unstable_PopoverArrowProps = unstable_BoxProps;

export function usePopoverArrow(
  options: unstable_PopoverArrowOptions,
  htmlProps: unstable_PopoverArrowProps = {}
) {
  const [placement] = options.placement.split("-");
  const transformMap = {
    top: "rotateZ(180deg)",
    right: "rotateZ(-90deg)",
    bottom: "rotateZ(360deg)",
    left: "rotateZ(90deg)"
  };
  htmlProps = mergeProps(
    {
      ref: options.arrowRef,
      style: {
        ...options.arrowStyles,
        position: "absolute",
        fontSize: "30px",
        width: "1em",
        height: "1em",
        pointerEvents: "none",
        transform: transformMap[placement as keyof typeof transformMap],
        [placement]: "100%"
      },
      children: (
        <svg viewBox="0 0 30 30">
          <path
            className="stroke"
            d="M23.7,27.1L17,19.9C16.5,19.3,15.8,19,15,19s-1.6,0.3-2.1,0.9l-6.6,7.2C5.3,28.1,3.4,29,2,29h26
        C26.7,29,24.6,28.1,23.7,27.1z"
          />
          <path
            className="fill"
            d="M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z"
          />
        </svg>
      )
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useHook("usePopoverArrow", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_PopoverArrowOptions> = [
  ...useBox.keys,
  ...usePopoverState.keys
];

usePopoverArrow.keys = keys;

export const PopoverArrow = unstable_createComponent("div", usePopoverArrow);
