import {
  MutableRefObject,
  RefObject,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
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
  padding = 8,
  arrowPadding = 4,
  flip = true,
  gutter,
  shift = 0,
  preventOverflow = true,
  sameWidth = false,
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
  const [rendered, render] = useReducer(() => ({}), {});

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
          middlewares.offset(({ placement }) => {
            const start = placement.split("-")[1] === "start";
            return {
              crossAxis: start ? shift : -shift,
              mainAxis: finalGutter,
            };
          }),
        ];

        if (preventOverflow) {
          middleware.push(middlewares.shift({ padding }));
        }

        if (flip) {
          middleware.push(middlewares.flip({ padding }));
        }

        middleware.push(
          middlewares.size({
            padding,
            apply({ /*height,*/ reference }) {
              if (sameWidth) {
                popover.style.width = `${reference.width}px`;
              }
              // TODO: Add support for `maxSize` or something
              // Object.assign(popover.style, {
              //   maxHeight: `${height}px`,
              // });
            },
          })
        );

        if (arrow) {
          middleware.push(
            middlewares.arrow({ element: arrow, padding: arrowPadding })
          );
        }

        const pos = await computePosition(anchor, popover, {
          placement,
          strategy: fixed ? "fixed" : "absolute",
          middleware,
        });

        setCurrentPlacement(pos.placement);

        Object.assign(popover.style, {
          position: "absolute",
          top: "0",
          left: "0",
          transform: `translate3d(${Math.round(pos.x)}px,${Math.round(
            pos.y
          )}px,0)`,
        });

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

      update();

      return autoUpdate(anchor, popover, update, {
        elementResize: typeof ResizeObserver === "function",
      });
    };

    if (renderCallback) {
      return renderCallback({
        defaultRenderCallback,
        setPlacement: setCurrentPlacement,
        mounted: dialog.mounted,
        gutter: finalGutter,
        placement,
        fixed,
        flip,
        padding,
        arrowPadding,
        preventOverflow,
        sameWidth,
        shift,
        popover,
        anchor,
        arrow,
      });
    }

    return defaultRenderCallback();
  }, [
    rendered,
    dialog.contentElement,
    anchorRect,
    shift,
    gutter,
    renderCallback,
    placement,
    fixed,
    dialog.mounted,
    flip,
    padding,
    arrowPadding,
    preventOverflow,
    sameWidth,
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
      padding,
      arrowPadding,
      flip,
      gutter,
      shift,
      preventOverflow,
      sameWidth,
      render,
      renderCallback,
    }),
    [
      dialog,
      anchorRect,
      setAnchorRect,
      currentPlacement,
      placement,
      fixed,
      padding,
      arrowPadding,
      flip,
      gutter,
      shift,
      preventOverflow,
      sameWidth,
      render,
      renderCallback,
    ]
  );

  return state;
}

export type PopoverStateRenderCallbackProps = Pick<
  PopoverState,
  | "fixed"
  | "flip"
  | "mounted"
  | "padding"
  | "arrowPadding"
  | "placement"
  | "preventOverflow"
  | "sameWidth"
  | "gutter"
  | "shift"
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
   * The minimum padding between the popover and the viewport edge.
   * @default 8
   */
  padding: number;
  /**
   * The minimum padding between the arrow and the popover corner.
   * @default 4
   */
  arrowPadding: number;
  /**
   * Whether the popover should flip to the opposite side of the viewport
   * when it overflows.
   * @default true
   */
  flip: boolean;
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
   * Whether the popover should prevent overflowing its clipping container.
   * @default true
   */
  preventOverflow: boolean;
  /**
   * Whether the popover should have the same width as the anchor element.
   * @default false
   */
  sameWidth: boolean;
  /**
   * A function that can be used to recompute the popover styles. This is useful
   * when the popover contents change in a way that affects its position or
   * size.
   */
  render: () => void;
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
      | "padding"
      | "arrowPadding"
      | "flip"
      | "gutter"
      | "shift"
      | "preventOverflow"
      | "sameWidth"
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
