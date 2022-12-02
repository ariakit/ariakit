import { createDisclosureStore } from "../disclosure/disclosure-store";
import {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
  createPopoverStore,
} from "../popover/popover-store";
import { Store, StoreOptions, StoreProps, createStore } from "../utils/store";

const tooltips = createStore({ activeRef: null as symbol | null });

function afterTimeout(timeoutMs: number, cb: () => void) {
  const timeoutId = setTimeout(cb, timeoutMs);
  return () => clearTimeout(timeoutId);
}

export function createTooltipStore({
  placement = "top",
  gutter = 8,
  timeout = 0,
  open,
  ...props
}: TooltipStoreProps = {}): TooltipStore {
  const disclosure = createDisclosureStore({ open, ...props });
  const popover = createPopoverStore({ placement, gutter, open, ...props });
  const initialState: TooltipStoreState = {
    ...popover.getState(),
    timeout,
  };
  const store = createStore(
    initialState,
    popover,
    disclosure.omit("open", "mounted")
  );

  const ref = Symbol();

  store.setup(() =>
    disclosure.sync(
      (state, prev) => {
        const { timeout } = store.getState();
        const { activeRef } = tooltips.getState();
        if (state.open) {
          if (!timeout || activeRef) {
            // If there's no timeout or an open tooltip already, we can show
            // this immediately.
            tooltips.setState("activeRef", ref);
            store.setState("open", true);
            return;
          } else {
            // There may be a reference with focus whose tooltip is still not
            // open. In this case, we want to update it before it gets shown.
            tooltips.setState("activeRef", null);
            // Wait for the timeout to show the tooltip.
            return afterTimeout(timeout, () => {
              tooltips.setState("activeRef", ref);
            });
          }
        } else if (state.open !== prev.open) {
          store.setState("open", false);
          // Let's give some time so people can move from a reference to
          // another and still show tooltips immediately.
          return afterTimeout(timeout, () => {
            tooltips.setState("activeRef", (activeRef) =>
              activeRef === ref ? null : activeRef
            );
          });
        }
        return;
      },
      ["open"]
    )
  );

  store.setup(() =>
    tooltips.sync(
      (state) => {
        store.setState("open", state.activeRef === ref);
      },
      ["activeRef"]
    )
  );

  store.setup(() => () => {
    tooltips.setState("activeRef", (activeRef) =>
      activeRef === ref ? null : activeRef
    );
  });

  return {
    ...popover,
    ...disclosure,
    ...store,
  };
}

export type TooltipStoreState = PopoverStoreState & {
  /**
   * The amount in milliseconds to wait before showing the tooltip. When there's
   * already an open tooltip in the page, this value will be ignored and other
   * tooltips will be shown immediately.
   * @default 0
   */
  timeout: number;
};

export type TooltipStoreFunctions = PopoverStoreFunctions;

export type TooltipStoreOptions = PopoverStoreOptions &
  StoreOptions<TooltipStoreState, "timeout">;

export type TooltipStoreProps = TooltipStoreOptions &
  StoreProps<TooltipStoreState>;

export type TooltipStore = TooltipStoreFunctions & Store<TooltipStoreState>;
