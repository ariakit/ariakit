import {
  PopoverStore as CorePopoverStore,
  PopoverStoreProps as CorePopoverStoreProps,
  PopoverStoreState,
  createPopoverStore,
} from "@ariakit/core/popover/popover-store";
import {
  DialogStoreProps,
  useDialogStoreOptions,
  useDialogStoreProps,
} from "../dialog/dialog-store";
import { useEvent } from "../utils/hooks";
import { Store, useStore, useStoreProps } from "../utils/store";

export function usePopoverStoreOptions(props: PopoverStoreProps) {
  const getAnchorRect = useEvent(props.getAnchorRect);
  const renderCallback = useEvent(props.renderCallback);
  return {
    ...useDialogStoreOptions(props),
    getAnchorRect,
    renderCallback,
  };
}

export function usePopoverStoreProps<T extends PopoverStore>(
  store: T,
  props: PopoverStoreProps
) {
  store = useDialogStoreProps(store, props);
  useStoreProps(store, props, "placement");
  useStoreProps(store, props, "fixed");
  useStoreProps(store, props, "gutter");
  useStoreProps(store, props, "flip");
  useStoreProps(store, props, "shift");
  useStoreProps(store, props, "slide");
  useStoreProps(store, props, "overlap");
  useStoreProps(store, props, "sameWidth");
  useStoreProps(store, props, "fitViewport");
  useStoreProps(store, props, "arrowPadding");
  useStoreProps(store, props, "overflowPadding");
  return store;
}

export function usePopoverStore(props: PopoverStoreProps = {}): PopoverStore {
  const options = usePopoverStoreOptions(props);
  let store = useStore(() => createPopoverStore({ ...props, ...options }));
  store = usePopoverStoreProps(store, props);
  return store;
}

export type { PopoverStoreState };

export type PopoverStore = Store<CorePopoverStore>;

export type PopoverStoreProps = CorePopoverStoreProps & DialogStoreProps;
