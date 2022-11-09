import {
  Middleware,
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
} from "@floating-ui/dom";
import { chain } from "ariakit-utils/misc";
import { Store, createStore } from "ariakit-utils/store";
import { SetState } from "ariakit-utils/types";
import {
  DialogStore,
  DialogStoreProps,
  DialogStoreState,
  createDialogStore,
} from "../dialog/dialog-store";

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

export function createPopoverStore({
  placement = "bottom",
  fixed = false,
  gutter,
  flip = true,
  shift = 0,
  slide = true,
  overlap = false,
  sameWidth = false,
  fitViewport = false,
  arrowPadding = 4,
  overflowPadding = 8,
  getAnchorRect,
  renderCallback,
  ...props
}: PopoverStoreProps = {}): PopoverStore {
  const rendered = createStore({ rendered: [] });
  const dialog = createDialogStore(props);
  const store = createStore<PopoverStoreState>(
    {
      anchorElement: null,
      popoverElement: null,
      arrowElement: null,
      placement,
      currentPlacement: placement,
      fixed,
      gutter,
      flip,
      shift,
      slide,
      overlap,
      sameWidth,
      fitViewport,
      arrowPadding,
      overflowPadding,
      ...dialog.getState(),
    },
    dialog
  );

  const setCurrentPlacement = (placement: Placement) => {
    store.setState("currentPlacement", placement);
  };

  const setup = () => {
    return chain(
      store.setup?.(),
      rendered.sync(() =>
        store.effect(
          (state) => {
            if (!state.contentElement?.isConnected) return;
            const popover = state.popoverElement;
            if (!popover) return;
            const anchor = getAnchorElement(state.anchorElement, getAnchorRect);

            popover.style.setProperty(
              "--popover-overflow-padding",
              `${state.overflowPadding}px`
            );

            const defaultRenderCallback = () => {
              const update = async () => {
                if (!state.mounted) return;

                const arrow = state.arrowElement;

                const middleware: Middleware[] = [
                  // https://floating-ui.com/docs/offset
                  middlewares.offset(({ placement }) => {
                    const arrowOffset = (arrow?.clientHeight || 0) / 2;
                    const finalGutter =
                      typeof state.gutter === "number"
                        ? state.gutter + arrowOffset
                        : state.gutter ?? arrowOffset;
                    // If there's no placement alignment (*-start or *-end),
                    // we'll fallback to the crossAxis offset as it also works
                    // for center-aligned placements.
                    const hasAlignment = !!placement.split("-")[1];
                    return {
                      crossAxis: !hasAlignment ? state.shift : undefined,
                      mainAxis: finalGutter,
                      alignmentAxis: state.shift,
                    };
                  }),
                ];

                if (state.flip !== false) {
                  const fallbackPlacements =
                    typeof state.flip === "string"
                      ? state.flip.split(" ")
                      : undefined;

                  if (
                    fallbackPlacements !== undefined &&
                    !fallbackPlacements.every(isValidPlacement)
                  ) {
                    throw new Error(
                      "`flip` expects a spaced-delimited list of placements"
                    );
                  }

                  // https://floating-ui.com/docs/flip
                  middleware.push(
                    middlewares.flip({
                      padding: overflowPadding,
                      fallbackPlacements,
                    })
                  );
                }

                if (state.slide || state.overlap) {
                  // https://floating-ui.com/docs/shift
                  middleware.push(
                    middlewares.shift({
                      mainAxis: state.slide,
                      crossAxis: state.overlap,
                      padding: state.overflowPadding,
                    })
                  );
                }

                // https://floating-ui.com/docs/size
                middleware.push(
                  middlewares.size({
                    padding: state.overflowPadding,
                    apply({ availableWidth, availableHeight, rects }) {
                      const referenceWidth = Math.round(rects.reference.width);
                      availableWidth = Math.floor(availableWidth);
                      availableHeight = Math.floor(availableHeight);
                      popover.style.setProperty(
                        "--popover-anchor-width",
                        `${referenceWidth}px`
                      );
                      popover.style.setProperty(
                        "--popover-available-width",
                        `${availableWidth}px`
                      );
                      popover.style.setProperty(
                        "--popover-available-height",
                        `${availableHeight}px`
                      );
                      if (sameWidth) {
                        popover.style.width = `${referenceWidth}px`;
                      }
                      if (fitViewport) {
                        popover.style.maxWidth = `${availableWidth}px`;
                        popover.style.maxHeight = `${availableHeight}px`;
                      }
                    },
                  })
                );

                if (arrow) {
                  // https://floating-ui.com/docs/arrow
                  middleware.push(
                    middlewares.arrow({
                      element: arrow,
                      padding: state.arrowPadding,
                    })
                  );
                }

                // https://floating-ui.com/docs/computePosition
                const pos = await computePosition(anchor, popover, {
                  placement: state.placement,
                  strategy: state.fixed ? "fixed" : "absolute",
                  middleware,
                });

                setCurrentPlacement(pos.placement);

                const x = Math.round(pos.x);
                const y = Math.round(pos.y);

                // https://floating-ui.com/docs/misc#subpixel-and-accelerated-positioning
                Object.assign(popover.style, {
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

              // https://floating-ui.com/docs/autoUpdate
              return autoUpdate(anchor, popover, update, {
                // JSDOM doesn't support ResizeObserver
                elementResize: typeof ResizeObserver === "function",
              });
            };

            let result: (() => void) | void;

            // TODO: This is needed because of default combobox example. Scroll
            // so the combobox popover should open above the combobox input.
            // Open the popover by clicking on the input, then press Escape,
            // then type something.
            queueMicrotask(() => {
              result = renderCallback
                ? renderCallback({
                    ...state,
                    setPlacement: setCurrentPlacement,
                    defaultRenderCallback,
                  })
                : defaultRenderCallback();
            });

            return () => {
              result?.();
            };

            // TODO: Think of another solution
            // if (renderCallback) {
            //   return renderCallback({
            //     ...state,
            //     setPlacement: setCurrentPlacement,
            //     defaultRenderCallback,
            //   });
            // }

            // return defaultRenderCallback();
          },
          [
            "anchorElement",
            "popoverElement",
            "arrowElement",
            "contentElement",
            "gutter",
            "mounted",
            "shift",
            "overlap",
            "flip",
            "overflowPadding",
            "slide",
            "sameWidth",
            "fitViewport",
            "arrowPadding",
            "placement",
            "fixed",
          ]
        )
      )
    );
  };

  const setAnchorElement: PopoverStore["setAnchorElement"] = (element) => {
    store.setState("anchorElement", element);
  };

  const setPopoverElement: PopoverStore["setPopoverElement"] = (element) => {
    store.setState("popoverElement", element);
  };

  const setArrowElement: PopoverStore["setArrowElement"] = (element) => {
    store.setState("arrowElement", element);
  };

  const render: PopoverStore["render"] = () => {
    rendered.setState("rendered", []);
  };

  return {
    ...dialog,
    ...store,
    setup,
    setAnchorElement,
    setPopoverElement,
    setArrowElement,
    render,
    getAnchorRect,
  };
}

export type PopoverStoreRenderCallbackProps = Pick<
  PopoverStoreState,
  | "anchorElement"
  | "popoverElement"
  | "arrowElement"
  | "mounted"
  | "placement"
  | "fixed"
  | "gutter"
  | "shift"
  | "overlap"
  | "flip"
  | "sameWidth"
  | "fitViewport"
  | "arrowPadding"
  | "overflowPadding"
> & {
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

export type PopoverStoreState = DialogStoreState & {
  /**
   * The anchor element.
   */
  anchorElement: HTMLElement | null;
  /**
   * The popover element that will render the placement attributes.
   */
  popoverElement: HTMLElement | null;
  /**
   * The arrow element.
   */
  arrowElement: HTMLElement | null;
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
   * Controls the behavior of the popover when it overflows the viewport:
   *   - If a `boolean`, specifies whether the popover should flip to the
   *     opposite side when it overflows.
   *   - If a `string`, indicates the preferred fallback placements when it
   *     overflows. The placements must be spaced-delimited, e.g. "top left".
   * @default true
   */
  flip: boolean | string;
  /**
   * Whether the popover should slide when it overflows.
   * @default true
   */
  slide: boolean;
  /**
   * Whether the popover can overlap the anchor element when it overflows.
   * @default false
   */
  overlap: boolean;
  /**
   * Whether the popover should have the same width as the anchor element. This
   * will be exposed to CSS as `--popover-anchor-width`.
   * @default false
   */
  sameWidth: boolean;
  /**
   * Whether the popover should fit the viewport. If this is set to true, the
   * popover wrapper will have `maxWidth` and `maxHeight` set to the viewport
   * size. This will be exposed to CSS as `--popover-available-width` and
   * `--popover-available-height`.
   * @default false
   */
  fitViewport: boolean;
  /**
   * The minimum padding between the arrow and the popover corner.
   * @default 4
   */
  arrowPadding: number;
  /**
   * The minimum padding between the popover and the viewport edge. This will be
   * exposed to CSS as `--popover-overflow-padding`.
   * @default 8
   */
  overflowPadding: number;
};

export type PopoverStore = Omit<DialogStore, keyof Store> &
  Store<PopoverStoreState> & {
    setAnchorElement: SetState<PopoverStoreState["anchorElement"]>;
    setPopoverElement: SetState<PopoverStoreState["popoverElement"]>;
    setArrowElement: SetState<PopoverStoreState["arrowElement"]>;
    getAnchorRect?: (anchor: HTMLElement | null) => AnchorRect | null;
    /**
     * A function that will be called when the popover needs to calculate its
     * styles. It will override the internal behavior.
     */
    renderCallback?: (
      props: PopoverStoreRenderCallbackProps
    ) => void | (() => void);
    /**
     * A function that can be used to recompute the popover styles. This is useful
     * when the popover anchor changes in a way that affects the popover position.
     */
    render: () => void;
  };

export type PopoverStoreProps = DialogStoreProps &
  Partial<Pick<PopoverStore, "getAnchorRect" | "renderCallback">> &
  Partial<
    Pick<
      PopoverStoreState,
      | "placement"
      | "fixed"
      | "gutter"
      | "shift"
      | "flip"
      | "slide"
      | "overlap"
      | "sameWidth"
      | "fitViewport"
      | "arrowPadding"
      | "overflowPadding"
    >
  >;
