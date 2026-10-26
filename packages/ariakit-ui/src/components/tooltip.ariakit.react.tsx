import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import {
  createOptionalRender,
  hasContent,
} from "../react-utils/create-render.react.ts";
import { wrapsSlotChildren } from "../styles/control.ts";
import { tooltip, tooltipShortcut } from "../styles/tooltip.ts";

type TooltipProviderPropKey =
  | "store"
  | "open"
  | "setOpen"
  | "defaultOpen"
  | "placement"
  | "timeout"
  | "showTimeout"
  | "hideTimeout"
  | "skipTimeout";

export interface TooltipProps
  extends
    Omit<TooltipPopoverProps, "children" | "content" | TooltipProviderPropKey>,
    Pick<ak.TooltipProviderProps, TooltipProviderPropKey> {
  /**
   * The anchor: one element that spreads the props it receives and forwards its
   * ref, such as `Button`. For a disabled anchor, use `accessibleWhenDisabled`
   * so it can still receive focus and hover. An element that ignores the props
   * never shows the tooltip, with no warning.
   */
  children: React.ReactElement;
  /**
   * The tooltip content, as text or other nodes. Unlike the `content` prop of
   * `Disclosure`, it does not take an element or props for the popup. Empty
   * content, such as `null`, `false`, a blank string, or an empty list, renders
   * only the anchor. The anchor remounts when its content becomes empty or
   * stops being empty, so it loses focus and its state at that time.
   */
  content?: React.ReactNode;
  /**
   * An arrow that points to the anchor, as `true`, an element, or
   * `TooltipArrow` props. Omitted by default.
   */
  arrow?: boolean | React.ReactElement | TooltipArrowProps;
}

/**
 * Shows a tooltip for its child element, which becomes the anchor. Other props
 * go to the `TooltipPopover`, so `className` and variant props style the
 * tooltip, and provider props such as `placement` go to the `TooltipProvider`.
 * The tooltip is visual only, so the anchor needs its own accessible name, such
 * as `aria-label` on an icon button.
 * @example
 * <Tooltip content="Save changes">
 *   <Button>Save</Button>
 * </Tooltip>
 */
export function Tooltip({
  children,
  content,
  arrow,
  store,
  open,
  setOpen,
  defaultOpen,
  placement,
  timeout,
  showTimeout,
  hideTimeout,
  skipTimeout,
  ...props
}: TooltipProps) {
  if (!hasContent(content)) return children;
  const arrowElement = createOptionalRender(
    TooltipArrow,
    arrow === true ? {} : arrow,
  );
  return (
    <ak.TooltipProvider
      store={store}
      open={open}
      setOpen={setOpen}
      defaultOpen={defaultOpen}
      placement={placement}
      timeout={timeout}
      showTimeout={showTimeout}
      hideTimeout={hideTimeout}
      skipTimeout={skipTimeout}
    >
      <ak.TooltipAnchor render={children} />
      <TooltipPopover {...props}>
        {arrowElement}
        {content}
      </TooltipPopover>
    </ak.TooltipProvider>
  );
}

export interface TooltipProviderProps extends ak.TooltipProviderProps {}

/**
 * Shares visibility and anchor state between a tooltip and its anchor.
 * @example
 * <TooltipProvider>
 *   <TooltipAnchor render={<button type="button" />}>Save</TooltipAnchor>
 *   <TooltipPopover>Save changes</TooltipPopover>
 * </TooltipProvider>
 */
export function TooltipProvider(props: TooltipProviderProps) {
  return <ak.TooltipProvider {...props} />;
}

export interface TooltipAnchorProps extends ak.TooltipAnchorProps {}

/**
 * Shows its tooltip when the anchor receives hover or keyboard focus.
 * @example
 * <TooltipProvider>
 *   <TooltipAnchor render={<button type="button" />}>Save</TooltipAnchor>
 *   <TooltipPopover>Save changes</TooltipPopover>
 * </TooltipProvider>
 */
export function TooltipAnchor(props: TooltipAnchorProps) {
  return <ak.TooltipAnchor {...props} />;
}

export interface TooltipPopoverProps
  extends ak.TooltipProps, VariantProps<typeof tooltip> {}

/**
 * Renders the tooltip popup: a short label or description for its anchor. It is
 * not a dialog, so keep interactive content out of it.
 * @example
 * <TooltipProvider>
 *   <TooltipAnchor render={<button type="button" />}>Save</TooltipAnchor>
 *   <TooltipPopover>Save changes</TooltipPopover>
 * </TooltipProvider>
 */
export function TooltipPopover(props: TooltipPopoverProps) {
  const [variantProps, rest] = splitProps(props, tooltip);
  return <ak.Tooltip {...tooltip.jsx(variantProps)} {...rest} />;
}

export interface TooltipArrowProps extends ak.TooltipArrowProps {}

/**
 * Renders an arrow that points from the tooltip to its anchor.
 * @example
 * <TooltipProvider>
 *   <TooltipAnchor render={<button type="button" />}>Save</TooltipAnchor>
 *   <TooltipPopover>
 *     <TooltipArrow />
 *     Save changes
 *   </TooltipPopover>
 * </TooltipProvider>
 */
export function TooltipArrow(props: TooltipArrowProps) {
  return <ak.TooltipArrow {...props} />;
}

export interface TooltipShortcutProps
  extends ak.RoleProps<"span">, VariantProps<typeof tooltipShortcut> {}

/**
 * Renders a keyboard shortcut after the tooltip text, styled like the shortcut
 * slot of a control. Wrap each key in a `kbd` element. The tooltip is visual
 * only, so give the anchor `aria-keyshortcuts` too.
 * @example
 * <Tooltip
 *   content={
 *     <>
 *       Bold
 *       <TooltipShortcut>
 *         <kbd>⌘</kbd>
 *         <kbd>B</kbd>
 *       </TooltipShortcut>
 *     </>
 *   }
 * >
 *   <Button aria-label="Bold" aria-keyshortcuts="Meta+B">…</Button>
 * </Tooltip>
 */
export function TooltipShortcut(props: TooltipShortcutProps) {
  const [variantProps, rest] = splitProps(props, tooltipShortcut);
  const variants = tooltipShortcut.getVariants(variantProps);
  return (
    <ak.Role.span {...tooltipShortcut.jsx(variantProps)} {...rest}>
      {wrapsSlotChildren(variants.$kind) ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}
