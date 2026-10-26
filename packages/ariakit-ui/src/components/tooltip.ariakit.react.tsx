import * as ak from "@ariakit/react";
import { mergeProps, useSafeLayoutEffect } from "@ariakit/react-utils";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import {
  createOptionalRender,
  hasContent,
} from "../react-utils/create-render.react.ts";
import { wrapsSlotChildren } from "../styles/control.ts";
import {
  tooltip,
  tooltipGroupWrapper,
  tooltipShortcut,
} from "../styles/tooltip.ts";

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
   * no popup and keeps the anchor mounted.
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
 * as `aria-label` on an icon button. Inside a `TooltipGroup`, the tooltips
 * share one popup, and provider props have no effect.
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
  const group = React.useContext(TooltipGroupContext);
  const empty = !hasContent(content);
  if (group) {
    return (
      <TooltipChildAnchor
        empty={empty}
        register={(element) =>
          group.register(element, { content, arrow, popover: props })
        }
      >
        {children}
      </TooltipChildAnchor>
    );
  }
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
      <TooltipChildAnchor empty={empty}>{children}</TooltipChildAnchor>
      {!empty && (
        <TooltipPopover {...props}>
          {arrowElement}
          {content}
        </TooltipPopover>
      )}
    </ak.TooltipProvider>
  );
}

export interface TooltipGroupProps
  extends
    Omit<TooltipPopoverProps, "children" | "content" | TooltipProviderPropKey>,
    Pick<ak.TooltipProviderProps, TooltipProviderPropKey>,
    VariantProps<typeof tooltipGroupWrapper> {
  /** Content with `Tooltip` elements, which share the popup of the group. */
  children?: React.ReactNode;
  /**
   * An arrow that points to the active anchor, as `true`, an element, or
   * `TooltipArrow` props. A `Tooltip` in the group can replace it.
   */
  arrow?: TooltipProps["arrow"];
}

/**
 * Renders one tooltip popup that the `Tooltip` elements inside it share. The
 * popup shows the content of the hovered or focused anchor and slides from one
 * anchor to the next; `$slide={false}` turns the slide off. Group props go to
 * the popup, and popup props on a `Tooltip` apply while its anchor is active.
 * The content of a `Tooltip` renders in the popup of the group, so it reads
 * React context from around the group, not from providers between the group and
 * the `Tooltip`.
 * @example
 * <TooltipGroup placement="right">
 *   <Tooltip content="Inbox">
 *     <Button aria-label="Inbox">…</Button>
 *   </Tooltip>
 *   <Tooltip content="Calendar">
 *     <Button aria-label="Calendar">…</Button>
 *   </Tooltip>
 * </TooltipGroup>
 */
export function TooltipGroup({
  children,
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
}: TooltipGroupProps) {
  // A key list doesn't claim className and style, so they reach the popup.
  const [wrapperVariants, popoverProps] = splitProps(
    props,
    tooltipGroupWrapper.variantKeys,
  );
  const [items, setItems] = React.useState<
    ReadonlyMap<HTMLElement, TooltipGroupItem>
  >(() => new Map());
  const register = React.useCallback(
    (element: HTMLElement, item: TooltipGroupItem) => {
      setItems((items) => new Map(items).set(element, item));
      return () => {
        setItems((items) => {
          if (items.get(element) !== item) {
            return items;
          }
          const nextItems = new Map(items);
          nextItems.delete(element);
          return nextItems;
        });
      };
    },
    [],
  );
  const group = React.useMemo(() => ({ register }), [register]);
  return (
    <TooltipGroupContext.Provider value={group}>
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
        {children}
        <TooltipGroupPopover
          {...popoverProps}
          items={items}
          arrow={arrow}
          wrapperVariants={wrapperVariants}
        />
      </ak.TooltipProvider>
    </TooltipGroupContext.Provider>
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

type TooltipGroupItemPopoverProps = Omit<
  TooltipProps,
  "children" | "content" | "arrow" | TooltipProviderPropKey
>;

interface TooltipGroupItem {
  content: React.ReactNode;
  arrow: TooltipProps["arrow"];
  popover: TooltipGroupItemPopoverProps;
}

interface TooltipGroupContextValue {
  register: (element: HTMLElement, item: TooltipGroupItem) => () => void;
}

const TooltipGroupContext =
  React.createContext<TooltipGroupContextValue | null>(null);

// A shared tooltip can be showing for another anchor.
function isCurrentAnchor(store: ak.TooltipStore, element: HTMLElement | null) {
  const { anchorElement } = store.getState();
  if (!anchorElement) return true;
  return anchorElement === element;
}

// A tooltip that closes starts the skip window, where the next tooltip shows
// without its delay. A tooltip without content showed nothing, so it closes
// without the window. The anchor reads the skip timeout as the tooltip
// unmounts, which waits for an exit animation. No popup renders without
// content, so nothing animates, and the animation stops at once.
function hideWithoutSkip(store: ak.TooltipStore) {
  const { skipTimeout } = store.getState();
  store.setState("skipTimeout", 0);
  store.hide();
  store.stopAnimation();
  store.setState("skipTimeout", skipTimeout);
}

interface TooltipChildAnchorProps {
  children: React.ReactElement;
  empty: boolean;
  /** Registers the anchor with the group that shares the popup. */
  register?: (element: HTMLElement) => () => void;
}

function TooltipChildAnchor({
  children,
  empty,
  register,
}: TooltipChildAnchorProps) {
  const store = ak.useTooltipContext();
  const [element, setElement] = React.useState<HTMLElement | null>(null);
  const grouped = !!register;

  // Registers again on every render, so the shared popup gets the current
  // content before paint.
  useSafeLayoutEffect(() => {
    if (!register) return;
    if (!element) return;
    return register(element);
  }, [element, register]);

  // The shared popup renders nothing without its anchor, so nothing would hide
  // the tooltip on hover outside after the anchor unmounts. Close it then, or
  // the next anchor shows it without a hover or a delay.
  useSafeLayoutEffect(() => {
    if (!grouped) return;
    if (!store) return;
    if (!element) return;
    return () => {
      if (!isCurrentAnchor(store, element)) return;
      store.hide();
    };
  }, [grouped, element, store]);

  // The popup hides the tooltip on blur, Escape, and hover outside. Empty
  // content renders no popup, so close the tooltip when the content empties.
  // Otherwise, it would show by itself when content arrives.
  React.useEffect(() => {
    if (!empty) return;
    if (!store) return;
    if (!isCurrentAnchor(store, element)) return;
    hideWithoutSkip(store);
  }, [empty, element, store]);

  // Focus opens the tooltip also without content. Close it right after the
  // anchor opens it, so it doesn't stay open without a popup.
  const onFocusVisible = () => {
    queueMicrotask(() => {
      if (!store) return;
      hideWithoutSkip(store);
    });
  };

  return (
    <ak.TooltipAnchor
      ref={setElement}
      render={children}
      showOnHover={!empty}
      onFocusVisible={empty ? onFocusVisible : undefined}
    />
  );
}

interface TooltipGroupPopoverProps extends TooltipGroupItemPopoverProps {
  items: ReadonlyMap<HTMLElement, TooltipGroupItem>;
  arrow: TooltipProps["arrow"];
  wrapperVariants: VariantProps<typeof tooltipGroupWrapper>;
}

function TooltipGroupPopover({
  items,
  arrow,
  wrapperVariants,
  ...props
}: TooltipGroupPopoverProps) {
  const store = ak.useTooltipContext();
  const anchorElement = ak.useStoreState(store, "anchorElement");
  const item = anchorElement ? items.get(anchorElement) : undefined;
  if (!item) return null;
  if (!hasContent(item.content)) return null;
  // Props that an item leaves undefined keep the group props, and class names
  // add up.
  const popoverProps = mergeProps(props, item.popover);
  const { wrapperProps } = popoverProps;
  const itemArrow = item.arrow === undefined ? arrow : item.arrow;
  const arrowElement = createOptionalRender(
    TooltipArrow,
    itemArrow === true ? {} : itemArrow,
  );
  return (
    <TooltipPopover
      {...popoverProps}
      wrapperProps={{
        ...wrapperProps,
        ...tooltipGroupWrapper.jsx({
          ...wrapperVariants,
          className: wrapperProps?.className,
          style: wrapperProps?.style,
        }),
      }}
    >
      {arrowElement}
      {item.content}
    </TooltipPopover>
  );
}
