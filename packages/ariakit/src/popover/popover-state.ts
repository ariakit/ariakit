import {
  MutableRefObject,
  RefObject,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  BasePlacement,
  VirtualElement,
  applyStyles,
  createPopper,
} from "@popperjs/core";
import { useControlledState, useSafeLayoutEffect } from "ariakit-utils/hooks";
import { SetState } from "ariakit-utils/types";
import {
  DialogState,
  DialogStateProps,
  useDialogState,
} from "../dialog/dialog-state";

type Placement =
  | "auto-start"
  | "auto"
  | "auto-end"
  | "top-start"
  | "top"
  | "top-end"
  | "right-start"
  | "right"
  | "right-end"
  | "bottom-end"
  | "bottom"
  | "bottom-start"
  | "left-end"
  | "left"
  | "left-start";

type AnchorRect = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

function getDOMRect(anchorRect: AnchorRect | null) {
  if (!anchorRect) return new DOMRect();
  const { x, y, width, height } = anchorRect;
  return new DOMRect(x, y, width, height);
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

    if (renderCallback) {
      return renderCallback({
        setPlacement: setCurrentPlacement,
        mounted: dialog.mounted,
        gutter: finalGutter,
        placement,
        fixed,
        flip,
        padding,
        arrowPadding,
        preventOverflow,
        shift,
        popover,
        anchor,
        arrow,
      });
    }

    const popper = createPopper(anchor, popover, {
      // https://popper.js.org/components/v2/constructors/#options
      placement,
      strategy: fixed ? "fixed" : "absolute",
      modifiers: [
        {
          // https://popper.js.org/components/v2/modifiers/event-listeners/
          name: "eventListeners",
          enabled: dialog.mounted,
        },
        {
          // https://popper.js.org/components/v2/modifiers/apply-styles/
          name: "applyStyles",
          enabled: true,
          fn: (args) => {
            // Remove specific popper HTML attributes
            args.state.attributes.popper = {};
            // Add specific arrow styles
            const arrowStyles = args.state.styles.arrow;
            if (arrowStyles) {
              const dir = args.state.placement.split("-")[0] as BasePlacement;
              arrowStyles[dir] = "100%";
            }
            applyStyles.fn(args);
          },
        },
        {
          // https://popper.js.org/components/v2/modifiers/flip/
          name: "flip",
          enabled: flip,
          options: { padding },
        },
        {
          // https://popper.js.org/components/v2/modifiers/offset/
          name: "offset",
          options: {
            // Makes sure the shift value is applied to the popover element
            // consistently no matter the placement. That is, a negative shift
            // should move down a popover with a "right-end" placement, but move
            // it up when the placement is "right-start". A good example is a
            // sub menu that must have a small negative shift so the first menu
            // item is aligned with its menu button.
            offset: ({ placement }: { placement: Placement }) => {
              const start = placement.split("-")[1] === "start";
              return [start ? shift : -shift, finalGutter];
            },
          },
        },
        {
          // https://popper.js.org/components/v2/modifiers/prevent-overflow/
          name: "preventOverflow",
          enabled: preventOverflow,
          options: {
            padding,
            tetherOffset: finalGutter,
          },
        },
        {
          // https://popper.js.org/components/v2/modifiers/arrow/
          name: "arrow",
          enabled: !!arrow,
          options: { element: arrow, padding: arrowPadding },
        },
        {
          // https://popper.js.org/components/v2/modifiers/#custom-modifiers
          name: "updateState",
          phase: "write",
          requires: ["computeStyles"],
          enabled: dialog.mounted && process.env.NODE_ENV !== "test",
          fn: ({ state }) => setCurrentPlacement(state.placement),
        },
      ],
    });
    return popper.destroy;
  }, [
    rendered,
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
  | "gutter"
  | "shift"
> & {
  popover: HTMLElement;
  anchor: VirtualElement;
  arrow?: HTMLElement | null;
  setPlacement: SetState<Placement>;
};

export type PopoverState = DialogState & {
  /**
   * The coordinates that will be used to position the popover. When defined,
   * this will override the `anchorRef` prop.
   */
  anchorRect: AnchorRect | null;
  /**
   * Sets `anchorRect`.
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
  gutter?: number | string;
  /**
   * The skidding of the popover along the anchor element.
   * @default 0
   */
  shift: number | string;
  /**
   * Whether the popover should prevent overflowing its clipping container.
   * @default true
   */
  preventOverflow: boolean;
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
      | "setAnchorRect"
      | "placement"
      | "fixed"
      | "padding"
      | "arrowPadding"
      | "flip"
      | "gutter"
      | "shift"
      | "preventOverflow"
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
  };
