import {
  PopoverStore,
  PopoverStoreProps,
  PopoverStoreState,
  createPopoverStore,
} from "../popover/popover-store";
import { chain } from "../utils/misc";
import { PartialStore, Store, createStore } from "../utils/store";
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
  const store = createStore(initialState, popover);

  const setup = () => {
    return chain(
      store.setup(),
      store.sync(
        (state) => {
          store.setState("showTimeout", (value) => {
            if (showTimeout != undefined) return value;
            return state.timeout;
          });
          store.setState("hideTimeout", (value) => {
            if (hideTimeout != undefined) return value;
            return state.timeout;
          });
        },
        ["timeout"]
      )
    );
  };

  return {
    ...popover,
    ...store,
    setup,
    setAutoFocusOnShow: (value) => store.setState("autoFocusOnShow", value),
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

export type HovercardStore = Omit<PopoverStore, keyof Store> &
  Store<HovercardStoreState> & {
    setAutoFocusOnShow: SetState<HovercardStoreState["autoFocusOnShow"]>;
  };

export type HovercardStoreProps = Omit<
  PopoverStoreProps,
  keyof HovercardStore
> &
  PartialStore<HovercardStoreState> &
  Partial<Pick<HovercardStoreState, "timeout" | "showTimeout" | "hideTimeout">>;
