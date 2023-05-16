import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.js";
import { createPopoverStore } from "../popover/popover-store.js";
import { defaultValue } from "../utils/misc.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import { createStore } from "../utils/store.js";
import type { SetState } from "../utils/types.js";

/**
 * Creates a hovercard store.
 */
export function createHovercardStore(
  props: HovercardStoreProps = {}
): HovercardStore {
  const syncState = props.store?.getState();

  const popover = createPopoverStore({
    ...props,
    placement: defaultValue(
      props.placement,
      syncState?.placement,
      "bottom" as const
    ),
  });

  const timeout = defaultValue(props.timeout, syncState?.timeout, 500);

  const initialState: HovercardStoreState = {
    ...popover.getState(),
    timeout,
    showTimeout: defaultValue(props.showTimeout, syncState?.showTimeout),
    hideTimeout: defaultValue(props.hideTimeout, syncState?.hideTimeout),
    autoFocusOnShow: defaultValue(syncState?.autoFocusOnShow, false),
  };

  const hovercard = createStore(initialState, popover, props.store);

  return {
    ...popover,
    ...hovercard,
    setAutoFocusOnShow: (value) => hovercard.setState("autoFocusOnShow", value),
  };
}

export interface HovercardStoreState extends PopoverStoreState {
  /**
   * @default "bottom"
   */
  placement: PopoverStoreState["placement"];
  /**
   * The amount of time in milliseconds to wait before showing and hiding the
   * popover. To control the delay for showing and hiding separately, use
   * `showTimeout` and `hideTimeout`.
   * @default 500
   */
  timeout: number;
  /**
   * The amount of time in milliseconds to wait before **showing** the popover.
   * It defaults to the value passed to `timeout`.
   */
  showTimeout?: number;
  /**
   * The amount of time in milliseconds to wait before **hiding** the popover.
   * It defaults to the value passed to `timeout`.
   */
  hideTimeout?: number;
  /**
   * Whether the popover or an element inside it should be focused when it is
   * shown.
   * @default false
   */
  autoFocusOnShow: boolean;
}

export interface HovercardStoreFunctions extends PopoverStoreFunctions {
  /**
   * Sets the `autoFocusOnShow` state.
   */
  setAutoFocusOnShow: SetState<HovercardStoreState["autoFocusOnShow"]>;
}

export interface HovercardStoreOptions
  extends StoreOptions<
      HovercardStoreState,
      "placement" | "timeout" | "showTimeout" | "hideTimeout"
    >,
    PopoverStoreOptions {}

export type HovercardStoreProps = HovercardStoreOptions &
  StoreProps<HovercardStoreState>;

export type HovercardStore = HovercardStoreFunctions &
  Store<HovercardStoreState>;
