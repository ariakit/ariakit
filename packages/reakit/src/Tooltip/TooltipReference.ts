import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useForkRef } from "reakit-utils/useForkRef";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { useTooltipState, TooltipStateReturn } from "./TooltipState";

export type TooltipReferenceOptions = BoxOptions &
  Pick<Partial<TooltipStateReturn>, "unstable_referenceRef" | "baseId"> &
  Pick<TooltipStateReturn, "show" | "hide">;

export type TooltipReferenceHTMLProps = BoxHTMLProps;

export type TooltipReferenceProps = TooltipReferenceOptions &
  TooltipReferenceHTMLProps;

export const useTooltipReference = createHook<
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
      ref: useForkRef(options.unstable_referenceRef, htmlRef),
      tabIndex: 0,
      onFocus: useAllCallbacks(options.show, htmlOnFocus),
      onBlur: useAllCallbacks(options.hide, htmlOnBlur),
      onMouseEnter: useAllCallbacks(options.show, htmlOnMouseEnter),
      onMouseLeave: useAllCallbacks(options.hide, htmlOnMouseLeave),
      "aria-describedby": options.baseId,
      ...htmlProps
    };
  }
});

export const TooltipReference = createComponent({
  as: "div",
  useHook: useTooltipReference
});
