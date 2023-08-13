import type {
  DialogStoreFunctions,
  DialogStoreOptions,
  DialogStoreState,
} from "../dialog/dialog-store.js";
import { createDialogStore } from "../dialog/dialog-store.js";
import { defaultValue } from "../utils/misc.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import { createStore, mergeStore, omit } from "../utils/store.js";
import type { SetState } from "../utils/types.js";

type BasePlacement = "top" | "bottom" | "left" | "right";

type Placement =
  | BasePlacement
  | `${BasePlacement}-start`
  | `${BasePlacement}-end`;

/**
 * Creates a popover store.
 */
export function createPopoverStore({
  popover: otherPopover,
  ...props
}: PopoverStoreProps = {}): PopoverStore {
  const store = mergeStore(
    props.store,
    omit(otherPopover, [
      "arrowElement",
      "anchorElement",
      "contentElement",
      "popoverElement",
      "disclosureElement",
    ]),
  );
  const syncState = store?.getState();

  const dialog = createDialogStore({ ...props, store });

  const placement = defaultValue(
    props.placement,
    syncState?.placement,
    "bottom" as const,
  );

  const initialState: PopoverStoreState = {
    ...dialog.getState(),
    placement,
    currentPlacement: placement,
    anchorElement: defaultValue(syncState?.anchorElement, null),
    popoverElement: defaultValue(syncState?.popoverElement, null),
    arrowElement: defaultValue(syncState?.arrowElement, null),
    rendered: Symbol("rendered"),
  };
  const popover = createStore(initialState, dialog, store);

  return {
    ...dialog,
    ...popover,
    setAnchorElement: (element) => popover.setState("anchorElement", element),
    setPopoverElement: (element) => popover.setState("popoverElement", element),
    setArrowElement: (element) => popover.setState("arrowElement", element),
    render: () => popover.setState("rendered", Symbol("rendered")),
  };
}

export interface PopoverStoreState extends DialogStoreState {
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
   * A symbol that's used to recompute the popover position when the `render`
   * method is called.
   */
  rendered: symbol;
}

export interface PopoverStoreFunctions extends DialogStoreFunctions {
  /**
   * Sets the anchor element.
   */
  setAnchorElement: SetState<PopoverStoreState["anchorElement"]>;
  /**
   * Sets the popover element.
   */
  setPopoverElement: SetState<PopoverStoreState["popoverElement"]>;
  /**
   * Sets the arrow element.
   */
  setArrowElement: SetState<PopoverStoreState["arrowElement"]>;
  /**
   * A function that can be used to recompute the popover position. This is
   * useful when the popover anchor changes in a way that affects the popover
   * position.
   */
  render: () => void;
}

export interface PopoverStoreOptions
  extends StoreOptions<PopoverStoreState, "placement">,
    DialogStoreOptions {
  /**
   * A reference to another popover store that's controlling another popover to
   * keep them in sync.
   */
  popover?: PopoverStore;
}

export type PopoverStoreProps = PopoverStoreOptions &
  StoreProps<PopoverStoreState>;

export type PopoverStore = PopoverStoreFunctions & Store<PopoverStoreState>;
