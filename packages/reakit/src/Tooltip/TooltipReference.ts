import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { Keys } from "../__utils/types";
import { useTooltipState, TooltipStateReturn } from "./TooltipState";

export type TooltipReferenceOptions = BoxOptions &
  Pick<
    Partial<TooltipStateReturn>,
    "unstable_referenceRef" | "unstable_hiddenId"
  > &
  Pick<TooltipStateReturn, "show" | "hide">;

export type TooltipReferenceProps = BoxProps;

export function useTooltipReference(
  options: TooltipReferenceOptions,
  htmlProps: TooltipReferenceProps = {}
) {
  options = unstable_useOptions("useTooltipReference", options, htmlProps);
  htmlProps = mergeProps(
    {
      ref: options.unstable_referenceRef,
      tabIndex: 0,
      onFocus: options.show,
      onBlur: options.hide,
      onMouseEnter: options.show,
      onMouseLeave: options.hide,
      "aria-describedby": options.unstable_hiddenId
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useProps("useTooltipReference", options, htmlProps);
  return htmlProps;
}

const keys: Keys<TooltipStateReturn & TooltipReferenceOptions> = [
  ...useBox.__keys,
  ...useTooltipState.__keys
];

useTooltipReference.__keys = keys;

export const TooltipReference = unstable_createComponent({
  as: "div",
  useHook: useTooltipReference
});
