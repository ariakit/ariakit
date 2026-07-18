import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { tooltip } from "../styles/tooltip.ts";

export interface TooltipProviderProps extends ak.TooltipProviderProps {}

/**
 * @see https://ariakit.com/reference/tooltip-provider
 */
export function TooltipProvider(props: TooltipProviderProps) {
  return <ak.TooltipProvider {...props} />;
}

export interface TooltipAnchorProps extends ak.TooltipAnchorProps {}

/**
 * @see https://ariakit.com/reference/tooltip-anchor
 */
export function TooltipAnchor(props: TooltipAnchorProps) {
  return <ak.TooltipAnchor {...props} />;
}

export interface TooltipProps
  extends ak.TooltipProps, VariantProps<typeof tooltip> {}

/**
 * @see https://ariakit.com/reference/tooltip
 */
export function Tooltip(props: TooltipProps) {
  const [variantProps, rest] = splitProps(props, tooltip);
  // Ariakit communicates the open state through the data-open attribute
  // rather than the native open pseudo state. An explicit $state prop still
  // wins, e.g. "none" for static previews.
  return (
    <ak.Tooltip
      {...tooltip.jsx({
        ...variantProps,
        $state: variantProps.$state ?? "data",
      })}
      {...rest}
    />
  );
}

export interface TooltipArrowProps extends ak.TooltipArrowProps {}

/**
 * @see https://ariakit.com/reference/tooltip-arrow
 */
export function TooltipArrow(props: TooltipArrowProps) {
  return <ak.TooltipArrow {...props} />;
}
