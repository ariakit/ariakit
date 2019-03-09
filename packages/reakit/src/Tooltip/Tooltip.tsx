// TODO: Refactor
import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { unstable_useHook } from "../system/useHook";
import { Portal } from "../Portal/Portal";
import {
  unstable_HiddenOptions,
  unstable_HiddenProps,
  useHidden
} from "../Hidden/Hidden";
import { unstable_TooltipStateReturn, useTooltipState } from "./TooltipState";

export type unstable_TooltipOptions = unstable_HiddenOptions &
  Partial<unstable_TooltipStateReturn>;

export type unstable_TooltipProps = unstable_HiddenProps;

export function useTooltip(
  options: unstable_TooltipOptions = {},
  htmlProps: unstable_TooltipProps = {}
) {
  htmlProps = mergeProps(
    {
      role: "tooltip",
      ref: options.popoverRef,
      style: {
        ...options.popoverStyles,
        pointerEvents: "none"
      }
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useHidden(options, htmlProps);
  htmlProps = unstable_useHook("useTooltip", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_TooltipOptions> = [
  ...useHidden.keys,
  ...useTooltipState.keys
];

useTooltip.keys = keys;

export const Tooltip = unstable_createComponent(
  "div",
  useTooltip,
  // @ts-ignore: TODO typeof createElement
  (type, props, children) => {
    const element = unstable_useCreateElement(type, props, children);
    return <Portal>{element}</Portal>;
  }
);
