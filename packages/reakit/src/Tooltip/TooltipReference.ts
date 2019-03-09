import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { useTooltipState, unstable_TooltipStateReturn } from "./TooltipState";

export type unstable_TooltipReferenceOptions = unstable_BoxOptions &
  Partial<unstable_TooltipStateReturn> &
  Pick<unstable_TooltipStateReturn, "show" | "hide">;

export type unstable_TooltipReferenceProps = unstable_BoxProps;

export function useTooltipReference(
  options: unstable_TooltipReferenceOptions,
  htmlProps: unstable_TooltipReferenceProps = {}
) {
  htmlProps = mergeProps(
    {
      ref: options.referenceRef,
      tabIndex: 0,
      onFocus: options.show,
      onBlur: options.hide,
      onMouseEnter: options.show,
      onMouseLeave: options.hide,
      "aria-describedby": options.baseId
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useHook("useTooltipReference", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_TooltipReferenceOptions> = [
  ...useBox.keys,
  ...useTooltipState.keys
];

useTooltipReference.keys = keys;

export const TooltipReference = unstable_createComponent(
  "div",
  useTooltipReference
);
