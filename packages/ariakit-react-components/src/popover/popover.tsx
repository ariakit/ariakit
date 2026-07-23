import { useStoreState } from "@ariakit/react-store";
import {
  useEvent,
  usePortalRef,
  useSafeLayoutEffect,
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { invariant } from "@ariakit/utils";
import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  limitShift,
  offset,
  shift,
  size,
} from "@floating-ui/dom";
import type { ElementType, HTMLAttributes } from "react";
import { useRef, useState } from "react";
import type { DialogOptions } from "../dialog/dialog.tsx";
import { createDialogComponent, useDialog } from "../dialog/dialog.tsx";
import { isHidden } from "../disclosure/disclosure-content.tsx";
import type { Placement } from "./__utils.ts";
import { getBasePlacement } from "./__utils.ts";
import {
  PopoverScopedContextProvider,
  usePopoverProviderContext,
} from "./popover-context.tsx";
import type { PopoverStore } from "./popover-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

interface AnchorRect {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface OverflowPaddingObject {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

type OverflowPadding = number | OverflowPaddingObject;

function createDOMRect(x = 0, y = 0, width = 0, height = 0) {
  if (typeof DOMRect === "function") {
    return new DOMRect(x, y, width, height);
  }
  // JSDOM doesn't support DOMRect constructor.
  const rect = {
    x,
    y,
    width,
    height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
  };
  return { ...rect, toJSON: () => rect };
}

function getDOMRect(anchorRect?: AnchorRect | null) {
  if (!anchorRect) return createDOMRect();
  const { x, y, width, height } = anchorRect;
  return createDOMRect(x, y, width, height);
}

function getAnchorElement(
  anchorElement: HTMLElement | null,
  getAnchorRect?: (anchor: HTMLElement | null) => AnchorRect | null,
) {
  // https://floating-ui.com/docs/virtual-elements
  const contextElement = anchorElement || undefined;
  return {
    contextElement,
    getBoundingClientRect: () => {
      const anchor = anchorElement;
      const anchorRect = getAnchorRect?.(anchor);
      if (anchorRect || !anchor) {
        return getDOMRect(anchorRect);
      }
      return anchor.getBoundingClientRect();
    },
  };
}

function isValidPlacement(flip: string): flip is Placement {
  return /^(?:top|bottom|left|right)(?:-(?:start|end))?$/.test(flip);
}

// https://floating-ui.com/docs/misc#subpixel-and-accelerated-positioning
function roundByDPR(value: number) {
  const dpr = window.devicePixelRatio || 1;
  return Math.round(value * dpr) / dpr;
}

function getOverflowPaddingValue(padding: OverflowPadding) {
  if (typeof padding === "number") return padding;
  return Math.max(padding.left ?? 0, padding.right ?? 0);
}

function getOffsetMiddleware(
  arrowElement: HTMLElement | null,
  props: Pick<PopoverOptions, "gutter" | "shift">,
) {
  // https://floating-ui.com/docs/offset
  return offset(({ placement }: { placement: Placement }) => {
    const arrowOffset = (arrowElement?.clientHeight || 0) / 2;
    const finalGutter =
      typeof props.gutter === "number"
        ? props.gutter + arrowOffset
        : (props.gutter ?? arrowOffset);
    // If there's no placement alignment (*-start or *-end),
    // we'll fallback to the crossAxis offset as it also works
    // for center-aligned placements.
    const hasAlignment = !!placement.split("-")[1];
    return {
      crossAxis: !hasAlignment ? props.shift : undefined,
      mainAxis: finalGutter,
      alignmentAxis: props.shift,
    };
  });
}

function getFlipMiddleware(
  props: Pick<PopoverOptions, "flip" | "overflowPadding">,
) {
  if (props.flip === false) return;
  const fallbackPlacements =
    typeof props.flip === "string" ? props.flip.split(" ") : undefined;

  invariant(
    !fallbackPlacements || fallbackPlacements.every(isValidPlacement),
    process.env.NODE_ENV !== "production" &&
      "`flip` expects a spaced-delimited list of placements",
  );

  // https://floating-ui.com/docs/flip
  return flip({
    padding: props.overflowPadding,
    fallbackPlacements,
  });
}

function getShiftMiddleware(
  props: Pick<
    PopoverOptions,
    "slide" | "shift" | "overlap" | "overflowPadding"
  >,
) {
  if (!props.slide && !props.overlap) return;
  // https://floating-ui.com/docs/shift
  return shift({
    mainAxis: props.slide,
    crossAxis: props.overlap,
    padding: props.overflowPadding,
    limiter: limitShift(),
  });
}

function getSizeMiddleware(
  props: Pick<PopoverOptions, "sameWidth" | "fitViewport" | "overflowPadding">,
  shouldCancel?: () => boolean,
) {
  // https://floating-ui.com/docs/size
  return size({
    padding: props.overflowPadding,
    apply({ elements, availableWidth, availableHeight, rects }) {
      // The size middleware runs during computePosition, before the awaited
      // call resolves. Ignore stale runs before mutating sizing styles.
      if (shouldCancel?.()) return;

      const wrapper = elements.floating;
      const referenceWidth = Math.round(rects.reference.width);

      availableWidth = Math.floor(availableWidth);
      availableHeight = Math.floor(availableHeight);

      wrapper.style.setProperty(
        "--popover-anchor-width",
        `${referenceWidth}px`,
      );
      wrapper.style.setProperty(
        "--popover-available-width",
        `${availableWidth}px`,
      );
      wrapper.style.setProperty(
        "--popover-available-height",
        `${availableHeight}px`,
      );

      if (props.sameWidth) {
        wrapper.style.width = `${referenceWidth}px`;
      }

      if (props.fitViewport) {
        wrapper.style.maxWidth = `${availableWidth}px`;
        wrapper.style.maxHeight = `${availableHeight}px`;
      }
    },
  });
}

function getArrowMiddleware(
  arrowElement: HTMLElement | null,
  props: Pick<PopoverOptions, "arrowPadding">,
) {
  if (!arrowElement) return;
  // https://floating-ui.com/docs/arrow
  return arrow({
    element: arrowElement,
    padding: props.arrowPadding,
  });
}

/**
 * Returns props to create a `Popover` component.
 * @see https://ariakit.com/components/popover
 * @example
 * ```jsx
 * const store = usePopoverStore();
 * const props = usePopover({ store });
 * <Role {...props}>Popover</Role>
 * ```
 */
export const usePopover = createHook<TagName, PopoverOptions>(
  function usePopover({
    store,
    modal = false,
    portal = modal,
    preserveTabOrder = true,
    autoFocusOnShow = true,
    wrapperProps,
    fixed = false,
    flip = true,
    shift = 0,
    slide = true,
    overlap = false,
    sameWidth = false,
    fitViewport = false,
    gutter,
    arrowPadding = 4,
    overflowPadding = 8,
    getAnchorRect,
    updatePosition,
    unstable_defaultAnchorElement,
    ...props
  }) {
    const context = usePopoverProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "Popover must receive a `store` prop or be wrapped in a PopoverProvider component.",
    );

    const arrowElement = useStoreState(store, "arrowElement");
    const anchorElement = useStoreState(
      store,
      ["anchorElement", "disclosureElement"],
      (state) =>
        state.anchorElement ||
        unstable_defaultAnchorElement ||
        state.disclosureElement,
    );
    // The disclosure element is only used as the preserveTabOrder anchor,
    // which takes effect only on portals and is disabled by the dialog for
    // modal dialogs, so don't subscribe to it unless the feature can take
    // effect.
    const shouldPreserveTabOrder = preserveTabOrder && portal && !modal;
    const disclosureElement = useStoreState(
      store,
      shouldPreserveTabOrder ? ["disclosureElement"] : [],
      (state) => (shouldPreserveTabOrder ? state.disclosureElement : null),
    );
    const popoverElement = useStoreState(store, "popoverElement");
    const contentElement = useStoreState(store, "contentElement");
    const placement = useStoreState(store, "placement");
    const mounted = useStoreState(store, "mounted");
    const rendered = useStoreState(store, "rendered");

    const defaultArrowElementRef = useRef<HTMLElement | null>(null);

    // We have to wait for the popover to be positioned for the first time
    // before we can move focus, otherwise there may be scroll jumps. See
    // popover-standalone example test-browser file.
    const [positioned, setPositioned] = useState(false);

    const { portalRef, domReady } = usePortalRef(portal, props.portalRef);

    const getAnchorRectProp = useEvent(getAnchorRect);
    const updatePositionProp = useEvent(updatePosition);
    const hasCustomUpdatePosition = !!updatePosition;
    const overflowPaddingTop =
      typeof overflowPadding === "number"
        ? overflowPadding
        : (overflowPadding.top ?? 0);
    const overflowPaddingRight =
      typeof overflowPadding === "number"
        ? overflowPadding
        : (overflowPadding.right ?? 0);
    const overflowPaddingBottom =
      typeof overflowPadding === "number"
        ? overflowPadding
        : (overflowPadding.bottom ?? 0);
    const overflowPaddingLeft =
      typeof overflowPadding === "number"
        ? overflowPadding
        : (overflowPadding.left ?? 0);

    // Whether the popover is unmounted (closed and not animating) while its
    // element stays both connected to the DOM and hidden. The alwaysVisible
    // and hidden props can keep the element visible while closed, in which
    // case the positioning effect below must keep running.
    const hiddenWhileUnmounted =
      !mounted && isHidden(mounted, props.hidden, props.alwaysVisible);

    useSafeLayoutEffect(() => {
      if (!popoverElement?.isConnected) return;

      const positioningPadding = {
        top: overflowPaddingTop,
        right: overflowPaddingRight,
        bottom: overflowPaddingBottom,
        left: overflowPaddingLeft,
      };

      // The overflow padding CSS variable is public API, so it's written even
      // while the popover is hidden.
      popoverElement.style.setProperty(
        "--popover-overflow-padding",
        `${getOverflowPaddingValue(positioningPadding)}px`,
      );

      // The popover element stays connected to the DOM when it's closed but
      // not unmounted. The default updatePosition function bails out while
      // unmounted, so autoUpdate would only keep ancestor scroll/resize
      // listeners and observers running for a hidden element. Skip all of it
      // and set everything up again once the popover is shown. Custom
      // updatePosition callbacks still run while hidden since they may
      // position the popover in ways that don't depend on the open state.
      if (hiddenWhileUnmounted && !hasCustomUpdatePosition) return;

      const anchor = getAnchorElement(anchorElement, getAnchorRectProp);

      // Each effect run owns this flag. Cleanup marks stale runs so in-flight
      // async positioning work can skip state and style writes.
      let canceled = false;

      const shouldCancelUpdate = () => {
        if (canceled) return true;
        if (!popoverElement.isConnected) return true;
        return false;
      };

      const updatePosition = async () => {
        if (shouldCancelUpdate()) return;
        if (!mounted) return;

        if (!arrowElement) {
          defaultArrowElementRef.current =
            defaultArrowElementRef.current || document.createElement("div");
        }

        const arrow = arrowElement || defaultArrowElementRef.current;

        const middleware = [
          getOffsetMiddleware(arrow, { gutter, shift }),
          getFlipMiddleware({
            flip,
            overflowPadding: positioningPadding,
          }),
          getShiftMiddleware({
            slide,
            shift,
            overlap,
            overflowPadding: positioningPadding,
          }),
          getArrowMiddleware(arrow, { arrowPadding }),
          getSizeMiddleware(
            {
              sameWidth,
              fitViewport,
              overflowPadding: positioningPadding,
            },
            shouldCancelUpdate,
          ),
        ];

        // https://floating-ui.com/docs/computePosition
        const pos = await computePosition(anchor, popoverElement, {
          placement,
          strategy: fixed ? "fixed" : "absolute",
          middleware,
        });

        // autoUpdate cleanup doesn't abort an in-flight computePosition call.
        // Check again before writing state or styles from an obsolete run.
        if (shouldCancelUpdate()) return;

        store?.setState("currentPlacement", pos.placement);
        setPositioned(true);

        const x = roundByDPR(pos.x);
        const y = roundByDPR(pos.y);

        // https://floating-ui.com/docs/misc#subpixel-and-accelerated-positioning
        Object.assign(popoverElement.style, {
          top: "0",
          left: "0",
          transform: `translate3d(${x}px,${y}px,0)`,
        });

        // https://floating-ui.com/docs/arrow#usage
        if (arrow && pos.middlewareData.arrow) {
          const { x: arrowX, y: arrowY } = pos.middlewareData.arrow;

          const side = getBasePlacement(pos.placement);

          const centerX = arrow.clientWidth / 2;
          const centerY = arrow.clientHeight / 2;

          const originX = arrowX != null ? arrowX + centerX : -centerX;
          const originY = arrowY != null ? arrowY + centerY : -centerY;

          popoverElement.style.setProperty(
            "--popover-transform-origin",
            {
              top: `${originX}px calc(100% + ${centerY}px)`,
              bottom: `${originX}px ${-centerY}px`,
              left: `calc(100% + ${centerX}px) ${originY}px`,
              right: `${-centerX}px ${originY}px`,
            }[side],
          );

          Object.assign(arrow.style, {
            left: arrowX != null ? `${arrowX}px` : "",
            top: arrowY != null ? `${arrowY}px` : "",
            // Reset the static side written for a previous placement before
            // writing the current one. Otherwise a stale `right`/`bottom`
            // lingers after a placement change and, in RTL contexts,
            // over-constrained absolute positioning lets the stale `right`
            // win over the freshly written `left`, detaching the arrow from
            // the anchor.
            right: "",
            bottom: "",
            [side]: "100%",
          });
        }
      };

      const update = async () => {
        if (shouldCancelUpdate()) return;

        if (hasCustomUpdatePosition) {
          await updatePositionProp({ updatePosition });
          // User callbacks may keep awaiting after updatePosition has run, so
          // make sure this effect is still current before marking it ready.
          if (shouldCancelUpdate()) return;
          setPositioned(true);
        } else {
          await updatePosition();
        }
      };

      // https://floating-ui.com/docs/autoUpdate
      const cancelAutoUpdate = autoUpdate(anchor, popoverElement, update, {
        // JSDOM doesn't support ResizeObserver
        elementResize: typeof ResizeObserver === "function",
      });

      return () => {
        canceled = true;
        setPositioned(false);
        cancelAutoUpdate();
      };
    }, [
      store,
      rendered,
      popoverElement,
      arrowElement,
      anchorElement,
      placement,
      mounted,
      hiddenWhileUnmounted,
      domReady,
      fixed,
      flip,
      shift,
      slide,
      overlap,
      sameWidth,
      fitViewport,
      gutter,
      arrowPadding,
      overflowPaddingTop,
      overflowPaddingRight,
      overflowPaddingBottom,
      overflowPaddingLeft,
      getAnchorRectProp,
      hasCustomUpdatePosition,
      updatePositionProp,
    ]);

    // Makes sure the wrapper element that's passed to floating UI has the same
    // z-index as the popover element so users only need to set the z-index
    // once.
    useSafeLayoutEffect(() => {
      if (!mounted) return;
      if (!domReady) return;
      if (!popoverElement?.isConnected) return;
      if (!contentElement?.isConnected) return;
      const applyZIndex = () => {
        popoverElement.style.zIndex = getComputedStyle(contentElement).zIndex;
      };
      applyZIndex();
      // It's possible that the zIndex value changes after the popover is
      // mounted, so we need to keep checking.
      let raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(applyZIndex);
      });
      return () => cancelAnimationFrame(raf);
    }, [mounted, domReady, popoverElement, contentElement]);

    const position = fixed ? "fixed" : "absolute";

    // Wrap our element in a div that will be used to position the popover.
    // This way the user doesn't need to override the popper's position to
    // create animations.
    props = useWrapElement(
      props,
      (element) => (
        <div
          {...wrapperProps}
          style={{
            // https://floating-ui.com/docs/computeposition#initial-layout
            position,
            top: 0,
            left: 0,
            width: "max-content",
            ...wrapperProps?.style,
          }}
          ref={store?.setPopoverElement}
        >
          {element}
        </div>
      ),
      [store, position, wrapperProps],
    );

    props = useWrapElement(
      props,
      (element) => (
        <PopoverScopedContextProvider value={store}>
          {element}
        </PopoverScopedContextProvider>
      ),
      [store],
    );

    props = {
      // data-placing is not part of the public API. We're setting this here so
      // we can wait for the popover to be positioned before other components
      // move focus into it. For example, this attribute is observed by the
      // Combobox component with the autoSelect behavior.
      "data-placing": !positioned || undefined,
      ...props,
      style: {
        position: "relative",
        ...props.style,
      },
    };

    props = useDialog({
      store,
      modal,
      portal,
      preserveTabOrder,
      preserveTabOrderAnchor: disclosureElement || anchorElement,
      autoFocusOnShow: positioned && autoFocusOnShow,
      ...props,
      portalRef,
    });

    return props;
  },
);

/**
 * Renders a popover element that's automatically positioned relative to an
 * anchor element.
 * @see https://ariakit.com/components/popover
 * @example
 * ```jsx {3}
 * <PopoverProvider>
 *   <PopoverDisclosure>Disclosure</PopoverDisclosure>
 *   <Popover>Popover</Popover>
 * </PopoverProvider>
 * ```
 */
export const Popover = createDialogComponent(
  forwardRef(function Popover(props: PopoverProps) {
    const htmlProps = usePopover(props);
    return createElement(TagName, htmlProps);
  }),
  usePopoverProviderContext,
);

export interface PopoverOptions<
  T extends ElementType = TagName,
> extends DialogOptions<T> {
  /**
   * Object returned by the
   * [`usePopoverStore`](https://ariakit.com/reference/use-popover-store) hook.
   * If not provided, the closest
   * [`PopoverProvider`](https://ariakit.com/reference/popover-provider)
   * component's context will be used.
   */
  store?: PopoverStore;
  /**
   * Props that will be passed to the popover wrapper element. This element will
   * be used to position the popover.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.com/examples/menubar-navigation)
   * - [Sliding Menu](https://ariakit.com/examples/menu-slide)
   */
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
  /**
   * Whether the popover has `position: fixed` or not.
   * @default false
   */
  fixed?: boolean;
  /**
   * @default false
   */
  modal?: DialogOptions<T>["modal"];
  /**
   * @default false
   */
  portal?: DialogOptions<T>["portal"];
  /**
   * The distance, in pixels, between the popover and the anchor element.
   *
   * Live examples:
   * - [Combobox filtering](https://ariakit.com/examples/combobox-filtering)
   * - [Form with Select](https://ariakit.com/examples/form-select)
   * - [Hovercard with keyboard support](https://ariakit.com/examples/hovercard-disclosure)
   * - [MenuItemRadio](https://ariakit.com/examples/menu-item-radio)
   * - [Submenu](https://ariakit.com/examples/menu-nested)
   * - [Toolbar with Select](https://ariakit.com/examples/toolbar-select)
   * @default 0
   */
  gutter?: number;
  /**
   * The skidding, in pixels, of the popover along the anchor element. Can be
   * set to negative values to make the popover shift to the opposite side.
   *
   * Live examples:
   * - [Combobox with Tabs](https://ariakit.com/examples/combobox-tabs)
   * - [Navigation Menubar](https://ariakit.com/examples/menubar-navigation)
   * - [Submenu](https://ariakit.com/examples/menu-nested)
   * - [Menubar](https://ariakit.com/components/menubar)
   * - [Select with Combobox and
   *   Tabs](https://ariakit.com/examples/select-combobox-tab)
   * @default 0
   */
  shift?: number;
  /**
   * Controls the behavior of the popover when it overflows the viewport:
   * - If a `boolean`, specifies whether the popover should flip to the opposite
   *   side when it overflows.
   * - If a `string`, indicates the preferred fallback placements when it
   *   overflows. The placements must be spaced-delimited, e.g. "top left".
   *
   * Live examples:
   * - [Sliding Menu](https://ariakit.com/examples/menu-slide)
   * - [Menubar](https://ariakit.com/components/menubar)
   * @default true
   */
  flip?: boolean | string;
  /**
   * Whether the popover should slide when it overflows.
   * @default true
   */
  slide?: boolean;
  /**
   * Whether the popover can overlap the anchor element when it overflows.
   *
   * Live examples:
   * - [Menubar](https://ariakit.com/components/menubar)
   * - [Submenu with
   *   Combobox](https://ariakit.com/examples/menu-nested-combobox)
   * @default false
   */
  overlap?: boolean;
  /**
   * Whether the popover should have the same width as the anchor element. This
   * will be exposed to CSS as
   * [`--popover-anchor-width`](https://ariakit.com/guide/styling#--popover-anchor-width).
   * @default false
   */
  sameWidth?: boolean;
  /**
   * Whether the popover should fit the viewport. If this is set to true, the
   * popover wrapper will have `maxWidth` and `maxHeight` set to the viewport
   * size. This will be exposed to CSS as
   * [`--popover-available-width`](https://ariakit.com/guide/styling#--popover-available-width)
   * and
   * [`--popover-available-height`](https://ariakit.com/guide/styling#--popover-available-height).
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.com/examples/combobox-textarea)
   * - [Menubar](https://ariakit.com/components/menubar)
   * @default false
   */
  fitViewport?: boolean;
  /**
   * The minimum padding, in pixels, between the arrow and the popover corner.
   * @default 4
   */
  arrowPadding?: number;
  /**
   * The minimum padding, in pixels, between the popover and the viewport edge.
   * Pass a number to use the same padding on every side, or an object to define
   * each side separately. This will be exposed to CSS as
   * [`--popover-overflow-padding`](https://ariakit.com/guide/styling#--popover-overflow-padding).
   * When passing an object, the CSS variable is the maximum of the horizontal
   * `left` and `right` values, with omitted sides treated as `0`.
   *
   * Live examples:
   * - [Sliding Menu](https://ariakit.com/examples/menu-slide)
   * @default 8
   */
  overflowPadding?: OverflowPadding;
  /**
   * Function that returns the anchor element's DOMRect. If this is explicitly
   * passed, it will override the anchor `getBoundingClientRect` method.
   *
   * Live examples:
   *  - [Textarea with inline combobox](https://ariakit.com/examples/combobox-textarea)
   *  - [Standalone Popover](https://ariakit.com/examples/popover-standalone)
   *  - [Context menu](https://ariakit.com/examples/menu-context-menu)
   *  - [Selection Popover](https://ariakit.com/examples/popover-selection)
   */
  getAnchorRect?: (anchor: HTMLElement | null) => AnchorRect | null;
  /**
   * A callback that will be called when the popover needs to calculate its
   * position. This will override the internal `updatePosition` function. The
   * original `updatePosition` function will be passed as an argument, so it can
   * be called inside the callback to apply the default behavior.
   *
   * Live examples:
   *  - [Responsive Popover](https://ariakit.com/examples/popover-responsive)
   */
  updatePosition?: (props: {
    updatePosition: () => Promise<void>;
  }) => void | Promise<void>;
  /**
   * Default positioning anchor used before the disclosure element.
   * @private
   */
  unstable_defaultAnchorElement?: HTMLElement | null;
}

export type PopoverProps<T extends ElementType = TagName> = Props<
  T,
  PopoverOptions<T>
>;
