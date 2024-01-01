import type {
  DialogStoreFunctions,
  DialogStoreOptions,
  DialogStoreState,
} from "../dialog/dialog-store.js";
import { createDialogStore } from "../dialog/dialog-store.js";
import { defaultValue } from "../utils/misc.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import {
  createStore,
  mergeStore,
  omit,
  throwOnConflictingProps,
} from "../utils/store.js";
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

  throwOnConflictingProps(props, store);

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
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
   */
  anchorElement: HTMLElement | null;
  /**
   * The popover element that will render the placement attributes.
   *
   * Live examples:
   * - [Form with Select](https://ariakit.org/examples/form-select)
   * - [Sliding Menu](https://ariakit.org/examples/menu-slide)
   * - [Responsive Popover](https://ariakit.org/examples/popover-responsive)
   */
  popoverElement: HTMLElement | null;
  /**
   * The arrow element.
   */
  arrowElement: HTMLElement | null;
  /**
   * The current temporary position of the popover. This might differ from the
   * [`placement`](https://ariakit.org/reference/popover-provider#placement)
   * state if the popover has had to adjust its position dynamically.
   *
   * Live examples:
   * - [Tooltip with Framer
   *   Motion](https://ariakit.org/examples/tooltip-framer-motion)
   */
  currentPlacement: Placement;
  /**
   * The placement of the popover.
   *
   * Live examples:
   * - [Submenu with
   *   Combobox](https://ariakit.org/examples/menu-nested-combobox)
   * - [Sliding Menu](https://ariakit.org/examples/menu-slide)
   * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
   * - [Selection Popover](https://ariakit.org/examples/popover-selection)
   * - [Standalone Popover](https://ariakit.org/examples/popover-standalone)
   * - [Select Grid](https://ariakit.org/examples/select-grid)
   * @default "bottom"
   */
  placement: Placement;
  /**
   * A symbol that's used to recompute the popover position when the
   * [`render`](https://ariakit.org/reference/use-popover-store#render) method
   * is called.
   */
  rendered: symbol;
}

export interface PopoverStoreFunctions extends DialogStoreFunctions {
  /**
   * Sets the anchor element.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
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
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * - [Selection Popover](https://ariakit.org/examples/popover-selection)
   */
  render: () => void;
}

export interface PopoverStoreOptions
  extends DialogStoreOptions,
    StoreOptions<PopoverStoreState, "placement"> {
  /**
   * A reference to another popover store that's controlling another popover to
   * keep them in sync.
   */
  popover?: PopoverStore | null;
}

export interface PopoverStoreProps
  extends PopoverStoreOptions,
    StoreProps<PopoverStoreState> {}

export interface PopoverStore
  extends PopoverStoreFunctions,
    Store<PopoverStoreState> {}
