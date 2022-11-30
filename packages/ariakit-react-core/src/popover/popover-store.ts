import * as Core from "@ariakit/core/popover/popover-store";
import {
  DialogStoreFunctions,
  DialogStoreOptions,
  DialogStoreState,
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
    getAnchorRect: props.getAnchorRect ? getAnchorRect : undefined,
    renderCallback: props.renderCallback ? renderCallback : undefined,
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
  const store = useStore(() =>
    Core.createPopoverStore({ ...props, ...options })
  );
  return usePopoverStoreProps(store, props);
}

export type PopoverStoreState = Core.PopoverStoreState & DialogStoreState;

export type PopoverStoreFunctions = Core.PopoverStoreFunctions &
  DialogStoreFunctions;

export type PopoverStoreOptions = Core.PopoverStoreOptions & DialogStoreOptions;

export type PopoverStoreProps = PopoverStoreOptions & Core.PopoverStoreProps;

export type PopoverStore = PopoverStoreFunctions & Store<Core.PopoverStore>;
