import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import {
  createOptionalRender,
  hasContent,
} from "../react-utils/create-render.react.ts";
import {
  TruncationContext,
  useTruncationRegistry,
} from "../react-utils/use-truncation.react.ts";
import { popoverPositioner } from "../styles/popover.ts";
import {
  tooltip,
  tooltipArrow,
  tooltipSlot,
  tooltipText,
} from "../styles/tooltip.ts";
import { usePopoverPositionerProps } from "./popover.ariakit.react.tsx";

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
   * The tooltip text, as a string or inline nodes such as `strong`. It renders
   * in a `TooltipText`. Empty text, such as `null`, `false`, a blank string, or
   * an empty list, turns the tooltip off. The anchor stays mounted when its
   * text becomes empty or stops being empty, so it keeps its state. It also
   * keeps focus if it's focusable without a tooltip, such as a button or a
   * link. A `TruncatedText` in the anchor also turns the tooltip off while its
   * text shows in full. While it is cut off, the tooltip uses the popover
   * surface with an edge, as with `$invert={false}`, unless `$invert` is set.
   */
  text?: React.ReactNode;
  /**
   * A slot before the text, such as an icon, as a `TooltipSlot` element or
   * `TooltipSlot` props. It shows only with `text`.
   */
  startSlot?: React.ReactElement | TooltipSlotProps;
  /**
   * A slot after the text, such as a keyboard shortcut or a badge, as a
   * `TooltipSlot` element or `TooltipSlot` props. It shows only with `text`.
   * For a shortcut, use a `text` slot with a `Kbd`, and give the anchor
   * `aria-keyshortcuts` too.
   */
  endSlot?: React.ReactElement | TooltipSlotProps;
  /**
   * An arrow that points to the anchor, as `true`, an element, or
   * `TooltipArrow` props. Omitted by default.
   */
  arrow?: boolean | React.ReactElement | TooltipArrowProps;
}

/**
 * Shows a tooltip for its child element, which becomes the anchor. Other props
 * go to the `TooltipPopover`, so `className` and variant props style the
 * tooltip, and store props such as `placement` go to the tooltip store. The
 * tooltip is visual only, so the anchor needs its own accessible name, such as
 * `aria-label` on an icon button.
 * @example
 * <Tooltip text="Save changes">
 *   <Button>Save</Button>
 * </Tooltip>
 * @example
 * <Tooltip
 *   text="Bold"
 *   endSlot={
 *     <TooltipSlot $kind="text">
 *       <Kbd>⌘B</Kbd>
 *     </TooltipSlot>
 *   }
 * >
 *   <Button aria-label="Bold" aria-keyshortcuts="Meta+B">…</Button>
 * </Tooltip>
 */
export function Tooltip({
  children,
  text,
  startSlot,
  endSlot,
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
  const truncation = useTruncationRegistry();
  // A TruncatedText in the anchor keeps the tooltip off while none of its text
  // is cut off.
  const hasText = hasContent(text) && truncation.truncated !== false;
  // The store goes straight to the anchor and the popover, as a provider would
  // also become the context of a disclosure in the anchor, and it would then
  // open the tooltip instead of its own dialog or popover.
  const tooltipStore = ak.useTooltipStore({
    store,
    // The tooltip closes when its text goes, and doesn't show when it comes
    // back. A store from outside keeps its open state: if it holds the tooltip
    // open, forcing it closed would never settle and would freeze the page.
    open: hasText || store ? open : false,
    setOpen,
    defaultOpen,
    placement,
    timeout,
    showTimeout,
    hideTimeout,
    skipTimeout,
  });
  const arrowElement = createOptionalRender(
    TooltipArrow,
    arrow === true ? {} : arrow,
  );
  return (
    <>
      {/* The tree keeps one shape, so a change of the text doesn't remount the
          anchor and move focus out of it. Without text, hover and focus on the
          anchor don't show the tooltip, so they can't hide another one or skip
          the next delay. */}
      <TruncationContext.Provider value={truncation.context}>
        <ak.TooltipAnchor
          store={tooltipStore}
          render={children}
          focusable={hasText}
          showOnHover={hasText}
        />
      </TruncationContext.Provider>
      {hasText && (
        <TooltipPopover
          store={tooltipStore}
          // The full text of a TruncatedText extends the text on the page, so
          // it keeps the popover surface and edge instead of a label that
          // inverts the page colors.
          $invert={truncation.truncated ? false : undefined}
          {...props}
        >
          {arrowElement}
          {createOptionalRender(TooltipSlot, startSlot)}
          <TooltipText>{text}</TooltipText>
          {createOptionalRender(TooltipSlot, endSlot)}
        </TooltipPopover>
      )}
    </>
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
  extends
    ak.TooltipProps,
    VariantProps<typeof tooltip>,
    VariantProps<typeof popoverPositioner> {}

/**
 * Renders the tooltip popup: a short label or description for its anchor. It is
 * not a dialog, so keep interactive content out of it. It unmounts while
 * hidden, unless `unmountOnHide` is `false`.
 * @example
 * <TooltipProvider>
 *   <TooltipAnchor render={<button type="button" />}>Save</TooltipAnchor>
 *   <TooltipPopover>Save changes</TooltipPopover>
 * </TooltipProvider>
 */
export function TooltipPopover({
  unmountOnHide = true,
  wrapperProps,
  ...props
}: TooltipPopoverProps) {
  const [variantProps, positionerProps, rest] = splitProps(
    props,
    tooltip,
    popoverPositioner,
  );
  const positioner = usePopoverPositionerProps(positionerProps, wrapperProps);
  return (
    <ak.Tooltip
      unmountOnHide={unmountOnHide}
      wrapperProps={positioner}
      {...tooltip.jsx(variantProps)}
      {...rest}
    />
  );
}

export interface TooltipArrowProps
  extends ak.TooltipArrowProps, VariantProps<typeof tooltipArrow> {}

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
  const [variantProps, rest] = splitProps(props, tooltipArrow);
  return <ak.TooltipArrow {...tooltipArrow.jsx(variantProps)} {...rest} />;
}

export interface TooltipSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof tooltipSlot> {}

/**
 * Renders an icon, badge, keyboard key, or short text beside the tooltip text,
 * like a slot of a control. For a keyboard shortcut, put a `Kbd` in a `text`
 * slot. Put the text beside it in a `TooltipText`. The tooltip is visual only,
 * so give the anchor `aria-keyshortcuts` too.
 * @example
 * <TooltipPopover>
 *   <TooltipText>Bold</TooltipText>
 *   <TooltipSlot $kind="text">
 *     <Kbd>⌘B</Kbd>
 *   </TooltipSlot>
 * </TooltipPopover>
 */
export function TooltipSlot(props: TooltipSlotProps) {
  const [variantProps, rest] = splitProps(props, tooltipSlot);
  return <ak.Role.span {...tooltipSlot.jsx(variantProps)} {...rest} />;
}

export interface TooltipTextProps
  extends ak.RoleProps<"span">, VariantProps<typeof tooltipText> {}

/**
 * Renders the tooltip text beside its slots. Inline elements, such as `strong`,
 * stay on its lines, and a line-tall slot sits as far from it as from the side
 * of the tooltip. `Tooltip` renders its `text` in it.
 * @example
 * <TooltipPopover>
 *   <TooltipSlot>
 *     <Check />
 *   </TooltipSlot>
 *   <TooltipText>Copied</TooltipText>
 * </TooltipPopover>
 */
export function TooltipText(props: TooltipTextProps) {
  const [variantProps, rest] = splitProps(props, tooltipText);
  return <ak.Role.span {...tooltipText.jsx(variantProps)} {...rest} />;
}
