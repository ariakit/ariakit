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
import {
  DialogStoreFunctions,
  DialogStoreOptions,
  DialogStoreState,
  createDialogStore,
} from "../dialog/dialog-store";
import { defaultValue } from "../utils/misc";
import {
  Store,
  StoreOptions,
  StoreProps,
  createStore,
  mergeStore,
} from "../utils/store";
import { SetState } from "../utils/types";

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
  getAnchorRect,
  renderCallback,
  popover: otherPopover,
  ...props
}: PopoverStoreProps = {}): PopoverStore {
  const store = mergeStore(
    props.store,
    otherPopover?.omit(
      "arrowElement",
      "anchorElement",
      "contentElement",
      "popoverElement",
      "disclosureElement"
    )
  );
  const syncState = store?.getState();

  const rendered = createStore({ rendered: [] });
  const dialog = createDialogStore({ ...props, store });

  const placement = defaultValue(
    props.placement,
    syncState?.placement,
    "bottom" as const
  );

  const initialState: PopoverStoreState = {
    ...dialog.getState(),
    placement,
    currentPlacement: placement,
    fixed: defaultValue(props.fixed, syncState?.fixed, false),
    gutter: defaultValue(props.gutter, syncState?.gutter),
    flip: defaultValue(props.flip, syncState?.flip, true),
    shift: defaultValue(props.shift, syncState?.shift, 0),
    slide: defaultValue(props.slide, syncState?.slide, true),
    overlap: defaultValue(props.overlap, syncState?.overlap, false),
    sameWidth: defaultValue(props.sameWidth, syncState?.sameWidth, false),
    fitViewport: defaultValue(props.fitViewport, syncState?.fitViewport, false),
    arrowPadding: defaultValue(props.arrowPadding, syncState?.arrowPadding, 4),
    overflowPadding: defaultValue(
      props.overflowPadding,
      syncState?.overflowPadding,
      8
    ),
    anchorElement: defaultValue(syncState?.anchorElement, null),
    popoverElement: defaultValue(syncState?.popoverElement, null),
    arrowElement: defaultValue(syncState?.arrowElement, null),
  };
  const popover = createStore(initialState, dialog, store);

  const setCurrentPlacement = (placement: Placement) => {
    popover.setState("currentPlacement", placement);
  };

  popover.setup(() =>
    rendered.sync(() =>
      popover.batchSync(
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
                    padding: state.overflowPadding,
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
                    if (state.sameWidth) {
                      popover.style.width = `${referenceWidth}px`;
                    }
                    if (state.fitViewport) {
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

          if (renderCallback) {
            return renderCallback({
              ...state,
              setPlacement: setCurrentPlacement,
              defaultRenderCallback,
            });
          }
          return defaultRenderCallback();
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

  return {
    ...dialog,
    ...popover,
    setAnchorElement: (element) => popover.setState("anchorElement", element),
    setPopoverElement: (element) => popover.setState("popoverElement", element),
    setArrowElement: (element) => popover.setState("arrowElement", element),
    render: () => rendered.setState("rendered", []),
    getAnchorRect,
    renderCallback,
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

export type PopoverStoreFunctions = DialogStoreFunctions & {
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

export type PopoverStoreOptions = DialogStoreOptions &
  Partial<Pick<PopoverStoreFunctions, "getAnchorRect" | "renderCallback">> &
  StoreOptions<
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
  > & {
    popover?: PopoverStore;
  };

export type PopoverStoreProps = PopoverStoreOptions &
  StoreProps<PopoverStoreState>;

export type PopoverStore = PopoverStoreFunctions & Store<PopoverStoreState>;
