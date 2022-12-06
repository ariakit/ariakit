import {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
  createPopoverStore,
} from "../popover/popover-store";
import { Store, StoreOptions, StoreProps, createStore } from "../utils/store";
import { SetState } from "../utils/types";

export function createHovercardStore({
  placement = "bottom",
  timeout = 500,
  showTimeout,
  hideTimeout,
  ...props
}: HovercardStoreProps = {}): HovercardStore {
  const popover = createPopoverStore({ placement, ...props });
  const initialState: HovercardStoreState = {
    ...popover.getState(),
    timeout,
    showTimeout: showTimeout ?? timeout,
    hideTimeout: hideTimeout ?? timeout,
    autoFocusOnShow: false,
  };
  const hovercard = createStore(initialState, popover);

  hovercard.setup(() =>
    hovercard.sync(
      (state) => {
        hovercard.setState("showTimeout", (value) => value ?? state.timeout);
        hovercard.setState("hideTimeout", (value) => value ?? state.timeout);
      },
      ["timeout"]
    )
  );

  return {
    ...popover,
    ...hovercard,
    setAutoFocusOnShow: (value) => hovercard.setState("autoFocusOnShow", value),
  };
}

export type HovercardStoreState = PopoverStoreState & {
  /**
   * The amount of time in milliseconds to wait before showing or hiding the
   * popover.
   * @default 500
   */
  timeout: number;
  /**
   * The amount of time in milliseconds to wait before **showing** the popover.
   * It defaults to the value passed to `timeout`.
   */
  showTimeout: number;
  /**
   * The amount of time in milliseconds to wait before **hiding** the popover.
   * It defaults to the value passed to `timeout`.
   */
  hideTimeout: number;
  /**
   * Whether the popover or an element inside it should be focused when it is
   * shown.
   * @default false
   */
  autoFocusOnShow: boolean;
};

export type HovercardStoreFunctions = PopoverStoreFunctions & {
  setAutoFocusOnShow: SetState<HovercardStoreState["autoFocusOnShow"]>;
};

export type HovercardStoreOptions = PopoverStoreOptions &
  StoreOptions<HovercardStoreState, "timeout" | "showTimeout" | "hideTimeout">;

export type HovercardStoreProps = HovercardStoreOptions &
  StoreProps<HovercardStoreState>;

export type HovercardStore = HovercardStoreFunctions &
  Store<HovercardStoreState>;
