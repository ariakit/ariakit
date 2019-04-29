import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";
import { useTooltipState, TooltipStateReturn } from "./TooltipState";

export type TooltipReferenceOptions = BoxOptions &
  Pick<
    Partial<TooltipStateReturn>,
    "unstable_referenceRef" | "unstable_hiddenId"
  > &
  Pick<TooltipStateReturn, "show" | "hide">;

export type TooltipReferenceProps = BoxProps;

export const useTooltipReference = unstable_createHook<
  TooltipReferenceOptions,
  TooltipReferenceProps
>({
  name: "TooltipReference",
  compose: useBox,
  useState: useTooltipState,

  useProps(options, htmlProps) {
    return mergeProps(
      {
        ref: options.unstable_referenceRef,
        tabIndex: 0,
        onFocus: options.show,
        onBlur: options.hide,
        onMouseEnter: options.show,
        onMouseLeave: options.hide,
        "aria-describedby": options.unstable_hiddenId
      } as TooltipReferenceProps,
      htmlProps
    );
  }
});

export const TooltipReference = unstable_createComponent({
  as: "div",
  useHook: useTooltipReference
});
