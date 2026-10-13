import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { tooltip } from "../styles/tooltip.ts";

export interface TooltipProviderProps extends ak.TooltipProviderProps {}

/**
 * Shares visibility and anchor state between a tooltip and its anchor.
 * @see https://ariakit.com/reference/tooltip-provider
 *
 * @example
 * <TooltipProvider>
 *   <TooltipAnchor render={<button type="button" />}>Save</TooltipAnchor>
 *   <Tooltip>Save changes</Tooltip>
 * </TooltipProvider>
 */
export function TooltipProvider(props: TooltipProviderProps) {
  return <ak.TooltipProvider {...props} />;
}

export interface TooltipAnchorProps extends ak.TooltipAnchorProps {}

/**
 * Shows its tooltip when the anchor receives hover or keyboard focus.
 * @see https://ariakit.com/reference/tooltip-anchor
 *
 * @example
 * <TooltipProvider>
 *   <TooltipAnchor render={<button type="button" />}>Save</TooltipAnchor>
 *   <Tooltip>Save changes</Tooltip>
 * </TooltipProvider>
 */
export function TooltipAnchor(props: TooltipAnchorProps) {
  return <ak.TooltipAnchor {...props} />;
}

export interface TooltipProps
  extends ak.TooltipProps, VariantProps<typeof tooltip> {}

/**
 * Renders a short label or description for its anchor.
 * @see https://ariakit.com/reference/tooltip
 *
 * @example
 * <TooltipProvider>
 *   <TooltipAnchor render={<button type="button" />}>Save</TooltipAnchor>
 *   <Tooltip>Save changes</Tooltip>
 * </TooltipProvider>
 */
export function Tooltip(props: TooltipProps) {
  const [variantProps, rest] = splitProps(props, tooltip);
  return <ak.Tooltip {...tooltip.jsx(variantProps)} {...rest} />;
}

export interface TooltipArrowProps extends ak.TooltipArrowProps {}

/**
 * Renders an arrow that points from the tooltip to its anchor.
 * @see https://ariakit.com/reference/tooltip-arrow
 *
 * @example
 * <TooltipProvider>
 *   <TooltipAnchor render={<button type="button" />}>Save</TooltipAnchor>
 *   <Tooltip>
 *     <TooltipArrow />
 *     Save changes
 *   </Tooltip>
 * </TooltipProvider>
 */
export function TooltipArrow(props: TooltipArrowProps) {
  return <ak.TooltipArrow {...props} />;
}
