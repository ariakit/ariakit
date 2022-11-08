import {
  PopoverStore as CorePopoverStore,
  PopoverStoreProps as CorePopoverStoreProps,
  PopoverStoreRenderCallbackProps,
  PopoverStoreState,
  createPopoverStore,
} from "ariakit-core/popover/popover-store";
import { useEvent } from "ariakit-react-utils/hooks";
import {
  ParentStore,
  Store,
  useStore,
  useStoreSync,
} from "ariakit-react-utils/store2";
import { SetState } from "ariakit-utils/types";

export function usePopoverStore(props: PopoverStoreProps = {}): PopoverStore {
  const getAnchorRect = useEvent(props.getAnchorRect);
  const renderCallback = useEvent(props.renderCallback);
  const store = useStore(() =>
    createPopoverStore({
      ...props.getState?.(),
      ...props,
      open: props.open ?? props.getState?.().open ?? props.defaultOpen,
      getAnchorRect,
      renderCallback: props.renderCallback ? renderCallback : undefined,
    })
  );

  useStoreSync(store, props, "open", "setOpen");
  useStoreSync(store, props, "animated");
  useStoreSync(store, props, "animating");
  useStoreSync(store, props, "contentElement");
  useStoreSync(store, props, "disclosureElement");
  useStoreSync(store, props, "placement");
  useStoreSync(store, props, "fixed");
  useStoreSync(store, props, "gutter");
  useStoreSync(store, props, "flip");
  useStoreSync(store, props, "shift");
  useStoreSync(store, props, "slide");
  useStoreSync(store, props, "overlap");
  useStoreSync(store, props, "sameWidth");
  useStoreSync(store, props, "fitViewport");
  useStoreSync(store, props, "arrowPadding");
  useStoreSync(store, props, "overflowPadding");

  return store;
}

export type { PopoverStoreState, PopoverStoreRenderCallbackProps };

export type PopoverStoreProps = CorePopoverStoreProps &
  ParentStore<PopoverStoreState> & {
    defaultOpen?: PopoverStoreState["open"];
    setOpen?: SetState<PopoverStoreState["open"]>;
  };

export type PopoverStore = Store<CorePopoverStore>;
