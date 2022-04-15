import { MutableRefObject, RefObject, useMemo, useRef, useState } from "react";
import {
  Middleware,
  VirtualElement,
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
} from "@floating-ui/dom";
import { useControlledState, useSafeLayoutEffect } from "ariakit-utils/hooks";
import { SetState } from "ariakit-utils/types";
import {
  DialogState,
  DialogStateProps,
  useDialogState,
} from "../dialog/dialog-state";

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

const middlewares = { arrow, flip, offset, shift, size };

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

function getDOMRect(anchorRect: AnchorRect | null) {
  if (!anchorRect) return createDOMRect();
  const { x, y, width, height } = anchorRect;
  return createDOMRect(x, y, width, height);
}

function getAnchorElement(
  anchorRef: RefObject<HTMLElement | null>,
  anchorRect: AnchorRect | null
) {
  // https://floating-ui.com/docs/virtual-elements
  const contextElement = anchorRef.current || undefined;
  return {
    contextElement,
    getBoundingClientRect: () =>
      anchorRect || !contextElement
        ? getDOMRect(anchorRect)
        : contextElement.getBoundingClientRect(),
  };
}

/**
 * Provides state for the `Popover` components.
 * @example
 * ```jsx
 * const popover = usePopoverState();
 * <PopoverDisclosure state={popover}>Disclosure</PopoverDisclosure>
 * <Popover state={popover}>Popover</Popover>
 * ```
 */
export function usePopoverState({
  placement = "bottom",
  fixed = false,
  gutter,
  flip = true,
  shift = 0,
  slide = true,
  sameWidth = false,
  fitViewport = false,
  arrowPadding = 4,
  overflowPadding = 8,
  renderCallback,
  ...props
}: PopoverStateProps = {}): PopoverState {
  const dialog = useDialogState(props);

  const [anchorRect, setAnchorRect] = useControlledState(
    props.defaultAnchorRect || null,
    props.anchorRect,
    props.setAnchorRect
  );

  const anchorRef = useRef<HTMLElement | null>(null);
  const popoverRef = useRef<HTMLElement>(null);
  const arrowRef = useRef<HTMLElement>(null);

  const [currentPlacement, setCurrentPlacement] = useState(placement);

  useSafeLayoutEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;
    const anchor = getAnchorElement(anchorRef, anchorRect);
    const arrow = arrowRef.current;
    const arrowOffset = (arrow?.clientHeight || 0) / 2;
    const finalGutter =
      typeof gutter === "number" ? gutter + arrowOffset : gutter ?? arrowOffset;

    const defaultRenderCallback = () => {
      const update = async () => {
        if (!dialog.mounted) return;

        const middleware: Middleware[] = [
          // https://floating-ui.com/docs/offset
          middlewares.offset(({ placement }) => {
            // If there's no placement alignment (*-start or *-end), we'll
            // fallback to the crossAxis offset as it also works for
            // center-aligned placements.
            const hasAlignment = !!placement.split("-")[1];
            return {
              crossAxis: !hasAlignment ? shift : undefined,
              mainAxis: finalGutter,
              alignmentAxis: shift,
            };
          }),
        ];

        if (flip) {
          // https://floating-ui.com/docs/flip
          middleware.push(middlewares.flip({ padding: overflowPadding }));
        }

        if (slide) {
          // https://floating-ui.com/docs/shift
          middleware.push(middlewares.shift({ padding: overflowPadding }));
        }

        if (sameWidth || fitViewport) {
          // https://floating-ui.com/docs/size
          middleware.push(
            middlewares.size({
              padding: overflowPadding,
              apply({ height, reference }) {
                if (sameWidth) {
                  popover.style.width = `${reference.width}px`;
                }
                if (fitViewport) {
                  popover.style.maxHeight = `${height}px`;
                }
              },
            })
          );
        }

        if (arrow) {
          // https://floating-ui.com/docs/arrow
          middleware.push(
            middlewares.arrow({ element: arrow, padding: arrowPadding })
          );
        }

        // https://floating-ui.com/docs/computePosition
        const pos = await computePosition(anchor, popover, {
          placement,
          strategy: fixed ? "fixed" : "absolute",
          middleware,
        });

        setCurrentPlacement(pos.placement);

        const x = Math.round(pos.x);
        const y = Math.round(pos.y);

        // https://floating-ui.com/docs/misc#subpixel-and-accelerated-positioning
        Object.assign(popover.style, {
          position: fixed ? "fixed" : "absolute",
          top: "0",
          left: "0",
          transform: `translate3d(${x}px, ${y}px, 0)`,
        });

        // https://floating-ui.com/docs/arrow#usage
        if (arrow && pos.middlewareData.arrow) {
          const { x: arrowX, y: arrowY } = pos.middlewareData.arrow;

          const dir = pos.placement.split("-")[0] as BasePlacement;

          Object.assign(arrow.style, {
            left: arrowX != null ? `${arrowX}px` : "",
            top: arrowY != null ? `${arrowY}px` : "",
            [dir]: "100%",
          });
        }
      };

      // autoUpdate does not call update immediately, so for the first update,
      // we should call the update function ourselves.
      update();

      // https://floating-ui.com/docs/autoUpdate
      return autoUpdate(anchor, popover, update, {
        // JSDOM doesn't support ResizeObserver
        elementResize: typeof ResizeObserver === "function",
      });
    };

    if (renderCallback) {
      return renderCallback({
        mounted: dialog.mounted,
        placement,
        fixed,
        gutter: finalGutter,
        shift,
        flip,
        sameWidth,
        fitViewport,
        arrowPadding,
        overflowPadding,
        popover,
        anchor,
        arrow,
        setPlacement: setCurrentPlacement,
        defaultRenderCallback,
      });
    }

    return defaultRenderCallback();
  }, [
    dialog.contentElement,
    anchorRect,
    gutter,
    dialog.mounted,
    shift,
    flip,
    overflowPadding,
    slide,
    sameWidth,
    fitViewport,
    arrowPadding,
    placement,
    fixed,
    renderCallback,
  ]);

  const state = useMemo(
    () => ({
      ...dialog,
      anchorRect,
      setAnchorRect,
      anchorRef,
      popoverRef,
      arrowRef,
      currentPlacement,
      placement,
      fixed,
      gutter,
      shift,
      flip,
      slide,
      sameWidth,
      fitViewport,
      arrowPadding,
      overflowPadding,
      renderCallback,
    }),
    [
      dialog,
      anchorRect,
      setAnchorRect,
      currentPlacement,
      placement,
      fixed,
      gutter,
      shift,
      flip,
      slide,
      sameWidth,
      fitViewport,
      arrowPadding,
      overflowPadding,
      renderCallback,
    ]
  );

  return state;
}

export type PopoverStateRenderCallbackProps = Pick<
  PopoverState,
  | "mounted"
  | "placement"
  | "fixed"
  | "gutter"
  | "shift"
  | "flip"
  | "sameWidth"
  | "fitViewport"
  | "arrowPadding"
  | "overflowPadding"
> & {
  /**
   * The popover element.
   */
  popover: HTMLElement;
  /**
   * The anchor element.
   */
  anchor: VirtualElement;
  /**
   * The arrow element.
   */
  arrow?: HTMLElement | null;
  /**
   * A method that updates the `currentPlacement` state.
   */
  setPlacement: SetState<Placement>;
  /**
   * The default render callback that will be called when the `renderCallback`
   * prop is not provided.
   */
  defaultRenderCallback: () => () => void;
};

export type PopoverState = DialogState & {
  /**
   * The coordinates that will be used to position the popover. When defined,
   * this will override the `anchorRef` prop.
   */
  anchorRect: AnchorRect | null;
  /**
   * Sets the `anchorRect` state.
   */
  setAnchorRect: SetState<PopoverState["anchorRect"]>;
  /**
   * The anchor element.
   */
  anchorRef: MutableRefObject<HTMLElement | null>;
  /**
   * The popover element that will render the placement attributes.
   */
  popoverRef: RefObject<HTMLElement>;
  /**
   * The arrow element.
   */
  arrowRef: RefObject<HTMLElement>;
  /**
   * The current temporary placement state of the popover. This may be different
   * from the the `placement` state if the popover has needed to update its
   * position on the fly.
   */
  currentPlacement: Placement;
  /**
   * The placement of the popover.
   * @default "bottom"
   */
  placement: Placement;
  /**
   * Whether the popover has `position: fixed` or not.
   * @default false
   */
  fixed: boolean;
  /**
   * The distance between the popover and the anchor element. By default, it's 0
   * plus half of the arrow offset, if it exists.
   * @default 0
   */
  gutter?: number;
  /**
   * The skidding of the popover along the anchor element.
   * @default 0
   */
  shift: number;
  /**
   * Whether the popover should flip to the opposite side of the viewport
   * when it overflows.
   * @default true
   */
  flip: boolean;
  /**
   * Whether the popover should slide when it overflows.
   * @default true
   */
  slide: boolean;
  /**
   * Whether the popover should have the same width as the anchor element.
   * @default false
   */
  sameWidth: boolean;
  /**
   * Whether the popover should fit the viewport. If this is set to true, the
   * popover wrapper will have `maxHeight` and `maxWidth` set to the viewport
   * size.
   * @default false
   */
  fitViewport: boolean;
  /**
   * The minimum padding between the arrow and the popover corner.
   * @default 4
   */
  arrowPadding: number;
  /**
   * The minimum padding between the popover and the viewport edge.
   * @default 8
   */
  overflowPadding: number;
  /**
   * A function that will be called when the popover needs to calculate its
   * styles. It will override the internal behavior.
   */
  renderCallback?: (
    props: PopoverStateRenderCallbackProps
  ) => void | (() => void);
};

export type PopoverStateProps = DialogStateProps &
  Partial<
    Pick<
      PopoverState,
      | "anchorRect"
      | "placement"
      | "fixed"
      | "gutter"
      | "shift"
      | "flip"
      | "slide"
      | "sameWidth"
      | "fitViewport"
      | "arrowPadding"
      | "overflowPadding"
      | "renderCallback"
    >
  > & {
    /**
     * The coordinates that will be used to position the popover. When defined,
     * this will override the `anchorRef` property.
     * @example
     * const popover = usePopoverState({
     *   defaultAnchorRect: { x: 10, y: 10, width: 100, height: 100 },
     * });
     */
    defaultAnchorRect?: PopoverState["anchorRect"];
    /**
     * Function that will be called when setting the popover `anchorRect` state.
     * @example
     * const [anchorRect, setAnchorRect] = useState(
     *   { x: 10, y: 10, width: 100, height: 100 }
     * );
     * usePopoverState({ anchorRect, setAnchorRect });
     */
    setAnchorRect?: (anchor: PopoverState["anchorRect"]) => void;
  };
