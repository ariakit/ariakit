import { chain } from "ariakit-utils/misc";
import { Store, createStore } from "ariakit-utils/store";
import { SetState } from "ariakit-utils/types";
import {
  PopoverStore,
  PopoverStoreProps,
  PopoverStoreState,
  createPopoverStore,
} from "../popover/popover-store";

export function createHovercardStore({
  timeout = 500,
  placement = "bottom",
  showTimeout,
  hideTimeout,
  ...props
}: HovercardStoreProps = {}): HovercardStore {
  const popover = createPopoverStore({ placement, ...props });
  const store = createStore<HovercardStoreState>(
    {
      timeout,
      showTimeout: showTimeout ?? timeout,
      hideTimeout: hideTimeout ?? timeout,
      autoFocusOnShow: false,
      ...popover.getState(),
    },
    popover
  );

  const setup = () => {
    return chain(
      store.setup?.(),
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

  const setAutoFocusOnShow: HovercardStore["setAutoFocusOnShow"] = (value) => {
    store.setState("autoFocusOnShow", value);
  };

  return {
    ...popover,
    ...store,
    setup,
    setAutoFocusOnShow,
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

export type HovercardStoreProps = PopoverStoreProps &
  Partial<Pick<HovercardStoreState, "timeout" | "showTimeout" | "hideTimeout">>;
