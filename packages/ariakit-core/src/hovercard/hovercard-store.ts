import {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
  createPopoverStore,
} from "../popover/popover-store";
import { defaultValue } from "../utils/misc";
import { Store, StoreOptions, StoreProps, createStore } from "../utils/store";
import { SetState } from "../utils/types";

export function createHovercardStore(
  props: HovercardStoreProps = {}
): HovercardStore {
  const store = props.store?.omit(
    "anchorElement",
    "popoverElement",
    "arrowElement",
    "contentElement",
    "disclosureElement"
  );
  const syncState = store?.getState();

  const timeout = defaultValue(props.timeout, syncState?.timeout, 500);

  const popover = createPopoverStore({
    ...props,
    placement: defaultValue(
      props.placement,
      syncState?.placement,
      "bottom" as const
    ),
  });

  const initialState: HovercardStoreState = {
    ...popover.getState(),
    timeout,
    showTimeout: defaultValue(
      props.showTimeout,
      syncState?.showTimeout,
      timeout
    ),
    hideTimeout: defaultValue(
      props.hideTimeout,
      syncState?.hideTimeout,
      timeout
    ),
    autoFocusOnShow: defaultValue(syncState?.autoFocusOnShow, false),
  };

  const hovercard = createStore(initialState, popover, store);

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
