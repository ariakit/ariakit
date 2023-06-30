import type { HTMLAttributes } from "react";
import { useState } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
} from "@floating-ui/dom";
import type { DialogOptions } from "../dialog/dialog.js";
import { useDialog } from "../dialog/dialog.js";
import {
  useEvent,
  usePortalRef,
  useSafeLayoutEffect,
  useWrapElement,
} from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { PopoverContext } from "./popover-context.js";
import type { PopoverStore } from "./popover-store.js";

type BasePlacement = "top" | "bottom" | "left" | "right";

type Placement =
  | BasePlacement
  | `${BasePlacement}-start`
  | `${BasePlacement}-end`;

type AnchorRect = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

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
  getAnchorRect?: (anchor: HTMLElement | null) => AnchorRect | null
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

function getOffsetMiddleware(
  arrowElement: HTMLElement | null,
  props: Pick<PopoverOptions, "gutter" | "shift">
) {
  // https://floating-ui.com/docs/offset
  return offset(({ placement }) => {
    const arrowOffset = (arrowElement?.clientHeight || 0) / 2;
    const finalGutter =
      typeof props.gutter === "number"
        ? props.gutter + arrowOffset
        : props.gutter ?? arrowOffset;
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
  props: Pick<PopoverOptions, "flip" | "overflowPadding">
) {
  if (props.flip === false) return;
  const fallbackPlacements =
    typeof props.flip === "string" ? props.flip.split(" ") : undefined;

  invariant(
    !fallbackPlacements || fallbackPlacements.every(isValidPlacement),
    process.env.NODE_ENV !== "production" &&
      "`flip` expects a spaced-delimited list of placements"
  );

  // https://floating-ui.com/docs/flip
  return flip({
    padding: props.overflowPadding,
    fallbackPlacements,
  });
}

function getShiftMiddleware(
  props: Pick<PopoverOptions, "slide" | "overlap" | "overflowPadding">
) {
  if (!props.slide && !props.overlap) return;
  // https://floating-ui.com/docs/shift
  return shift({
    mainAxis: props.slide,
    crossAxis: props.overlap,
    padding: props.overflowPadding,
  });
}

function getSizeMiddleware(
  props: Pick<PopoverOptions, "sameWidth" | "fitViewport" | "overflowPadding">
) {
  // https://floating-ui.com/docs/size
  return size({
    padding: props.overflowPadding,
    apply({ elements, availableWidth, availableHeight, rects }) {
      const wrapper = elements.floating;
      const referenceWidth = Math.round(rects.reference.width);

      availableWidth = Math.floor(availableWidth);
      availableHeight = Math.floor(availableHeight);

      wrapper.style.setProperty(
        "--popover-anchor-width",
        `${referenceWidth}px`
      );
      wrapper.style.setProperty(
        "--popover-available-width",
        `${availableWidth}px`
      );
      wrapper.style.setProperty(
        "--popover-available-height",
        `${availableHeight}px`
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
  props: Pick<PopoverOptions, "arrowPadding">
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
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const store = usePopoverStore();
 * const props = usePopover({ store });
 * <Role {...props}>Popover</Role>
 * ```
 */
export const usePopover = createHook<PopoverOptions>(
  ({
    store,
    modal = false,
    portal = !!modal,
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
    ...props
  }) => {
    const arrowElement = store.useState("arrowElement");
    const anchorElement = store.useState("anchorElement");
    const popoverElement = store.useState("popoverElement");
    const contentElement = store.useState("contentElement");
    const placement = store.useState("placement");
    const mounted = store.useState("mounted");
    const rendered = store.useState("rendered");

    // We have to wait for the popover to be positioned for the first time
    // before we can move focus, otherwise there may be scroll jumps. See
    // popover-standalone example test-browser file.
    const [positioned, setPositioned] = useState(false);

    const { portalRef, domReady } = usePortalRef(portal, props.portalRef);

    const getAnchorRectProp = useEvent(getAnchorRect);
    const updatePositionProp = useEvent(updatePosition);
    const hasCustomUpdatePosition = !!updatePosition;

    useSafeLayoutEffect(() => {
      if (!popoverElement?.isConnected) return;

      popoverElement.style.setProperty(
        "--popover-overflow-padding",
        `${overflowPadding}px`
      );

      const anchor = getAnchorElement(anchorElement, getAnchorRectProp);

      const updatePosition = async () => {
        if (!mounted) return;

        const middleware = [
          getOffsetMiddleware(arrowElement, { gutter, shift }),
          getFlipMiddleware({ flip, overflowPadding }),
          getShiftMiddleware({ slide, overlap, overflowPadding }),
          getArrowMiddleware(arrowElement, { arrowPadding }),
          getSizeMiddleware({
            sameWidth,
            fitViewport,
            overflowPadding,
          }),
        ];

        // https://floating-ui.com/docs/computePosition
        const pos = await computePosition(anchor, popoverElement, {
          placement,
          strategy: fixed ? "fixed" : "absolute",
          middleware,
        });

        store.setState("currentPlacement", pos.placement);
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
        if (arrowElement && pos.middlewareData.arrow) {
          const { x: arrowX, y: arrowY } = pos.middlewareData.arrow;

          const dir = pos.placement.split("-")[0] as BasePlacement;

          Object.assign(arrowElement.style, {
            left: arrowX != null ? `${arrowX}px` : "",
            top: arrowY != null ? `${arrowY}px` : "",
            [dir]: "100%",
          });
        }
      };

      const update = async () => {
        if (hasCustomUpdatePosition) {
          await updatePositionProp({ updatePosition });
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
        setPositioned(false);
        cancelAutoUpdate();
      };
    }, [
      store,
      rendered,
      popoverElement,
      arrowElement,
      anchorElement,
      popoverElement,
      placement,
      mounted,
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
      overflowPadding,
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
          role="presentation"
          {...wrapperProps}
          style={{
            // https://floating-ui.com/docs/computeposition#initial-layout
            position,
            top: 0,
            left: 0,
            width: "max-content",
            ...wrapperProps?.style,
          }}
          ref={store.setPopoverElement}
        >
          {element}
        </div>
      ),
      [store, position, wrapperProps]
    );

    props = useWrapElement(
      props,
      (element) => (
        <PopoverContext.Provider value={store}>
          {element}
        </PopoverContext.Provider>
      ),
      [store]
    );

    props = {
      // data-placing is not part of the public API. We're setting this here so
      // we can wait for the popover to be positioned before other components
      // move focus into it. For example, this attribute is observed by the
      // Combobox component with the autoSelect behavior.
      "data-placing": !positioned ? "" : undefined,
      ...props,
      style: {
        position: "relative",
        ...props.style,
      },
    };

    props = useDialog({
      store,
      modal,
      preserveTabOrder,
      portal,
      autoFocusOnShow: positioned && autoFocusOnShow,
      ...props,
      portalRef,
    });

    return props;
  }
);

/**
 * Renders a popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const popover = usePopoverStore();
 * <PopoverDisclosure store={popover}>Disclosure</PopoverDisclosure>
 * <Popover store={popover}>Popover</Popover>
 * ```
 */
export const Popover = createComponent<PopoverOptions>((props) => {
  const htmlProps = usePopover(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Popover.displayName = "Popover";
}

export interface PopoverOptions<T extends As = "div"> extends DialogOptions<T> {
  /**
   * Object returned by the `usePopoverStore` hook.
   * @see https://ariakit.org/guide/component-stores
   */
  store: PopoverStore;
  /**
   * Props that will be passed to the popover wrapper element. This element will
   * be used to position the popover.
   */
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
  /**
   * Whether the popover has `position: fixed` or not.
   * @default false
   */
  fixed?: boolean;
  /**
   * The distance between the popover and the anchor element.
   * @default 0
   */
  gutter?: number;
  /**
   * The skidding of the popover along the anchor element. Can be set to
   * negative values to make the popover shift to the opposite side.
   * @default 0
   */
  shift?: number;
  /**
   * Controls the behavior of the popover when it overflows the viewport:
   *   - If a `boolean`, specifies whether the popover should flip to the
   *     opposite side when it overflows.
   *   - If a `string`, indicates the preferred fallback placements when it
   *     overflows. The placements must be spaced-delimited, e.g. "top left".
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
   * @default false
   */
  overlap?: boolean;
  /**
   * Whether the popover should have the same width as the anchor element. This
   * will be exposed to CSS as
   * [`--popover-anchor-width`](https://ariakit.org/guide/styling#--popover-anchor-width).
   * @default false
   */
  sameWidth?: boolean;
  /**
   * Whether the popover should fit the viewport. If this is set to true, the
   * popover wrapper will have `maxWidth` and `maxHeight` set to the viewport
   * size. This will be exposed to CSS as
   * [`--popover-available-width`](https://ariakit.org/guide/styling#--popover-available-width)
   * and
   * [`--popover-available-height`](https://ariakit.org/guide/styling#--popover-available-height).
   * @default false
   */
  fitViewport?: boolean;
  /**
   * The minimum padding between the arrow and the popover corner.
   * @default 4
   */
  arrowPadding?: number;
  /**
   * The minimum padding between the popover and the viewport edge. This will be
   * exposed to CSS as
   * [`--popover-overflow-padding`](https://ariakit.org/guide/styling#--popover-overflow-padding).
   * @default 8
   */
  overflowPadding?: number;
  /**
   * Function that returns the anchor element's DOMRect. If this is explicitly
   * passed, it will override the anchor `getBoundingClientRect` method.
   *
   * Live examples:
   *  - [Textarea with inline combobox](https://ariakit.org/examples/combobox-textarea)
   *  - [Standalone Popover](https://ariakit.org/examples/popover-standalone)
   *  - [Context menu](https://ariakit.org/examples/menu-context-menu)
   *  - [Selection Popover](https://ariakit.org/examples/popover-selection)
   * @param anchor The anchor element.
   */
  getAnchorRect?: (anchor: HTMLElement | null) => AnchorRect | null;
  /**
   * A callback that will be called when the popover needs to calculate its
   * position. This will override the internal `updatePosition` function. The
   * original `updatePosition` function will be passed as an argument, so it can
   * be called inside the callback to apply the default behavior.
   *
   * Live examples:
   *  - [Responsive Popover](https://ariakit.org/examples/popover-responsive)
   */
  updatePosition?: (props: {
    updatePosition: () => Promise<void>;
  }) => void | Promise<void>;
}

export type PopoverProps<T extends As = "div"> = Props<PopoverOptions<T>>;
