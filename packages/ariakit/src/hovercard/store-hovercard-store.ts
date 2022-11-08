import {
  HovercardStore as CoreHovercardStore,
  HovercardStoreProps as CoreHovercardStoreProps,
  HovercardStoreState,
  createHovercardStore,
} from "ariakit-core/hovercard/hovercard-store";
import { useEvent } from "ariakit-react-utils/hooks";
import {
  ParentStore,
  Store,
  useStore,
  useStoreSync,
} from "ariakit-react-utils/store2";
import { SetState } from "ariakit-utils/types";

export function useHovercardStore(
  props: HovercardStoreProps = {}
): HovercardStore {
  const getAnchorRect = useEvent(props.getAnchorRect);
  const renderCallback = useEvent(props.renderCallback);
  const store = useStore(() =>
    createHovercardStore({
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
  useStoreSync(store, props, "timeout");
  useStoreSync(store, props, "showTimeout");
  useStoreSync(store, props, "hideTimeout");

  return store;
}

export type { HovercardStoreState };

export type HovercardStoreProps = CoreHovercardStoreProps &
  ParentStore<HovercardStoreState> & {
    defaultOpen?: HovercardStoreState["open"];
    setOpen?: SetState<HovercardStoreState["open"]>;
  };

export type HovercardStore = Store<CoreHovercardStore>;
