import { unstable_createComponent } from "../utils/createComponent";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";
import { mergeRefs } from "../__utils/mergeRefs";
import { useAllCallbacks } from "../__utils/useAllCallbacks";
import { useTooltipState, TooltipStateReturn } from "./TooltipState";

export type TooltipReferenceOptions = BoxOptions &
  Pick<
    Partial<TooltipStateReturn>,
    "unstable_referenceRef" | "unstable_hiddenId"
  > &
  Pick<TooltipStateReturn, "show" | "hide">;

export type TooltipReferenceHTMLProps = BoxHTMLProps;

export type TooltipReferenceProps = TooltipReferenceOptions &
  TooltipReferenceHTMLProps;

export const useTooltipReference = unstable_createHook<
  TooltipReferenceOptions,
  TooltipReferenceHTMLProps
>({
  name: "TooltipReference",
  compose: useBox,
  useState: useTooltipState,

  useProps(
    options,
    {
      ref: htmlRef,
      onFocus: htmlOnFocus,
      onBlur: htmlOnBlur,
      onMouseEnter: htmlOnMouseEnter,
      onMouseLeave: htmlOnMouseLeave,
      ...htmlProps
    }
  ) {
    return {
      ref: mergeRefs(options.unstable_referenceRef, htmlRef),
      tabIndex: 0,
      onFocus: useAllCallbacks(options.show, htmlOnFocus),
      onBlur: useAllCallbacks(options.hide, htmlOnBlur),
      onMouseEnter: useAllCallbacks(options.show, htmlOnMouseEnter),
      onMouseLeave: useAllCallbacks(options.hide, htmlOnMouseLeave),
      "aria-describedby": options.unstable_hiddenId,
      ...htmlProps
    };
  }
});

export const TooltipReference = unstable_createComponent({
  as: "div",
  useHook: useTooltipReference
});
