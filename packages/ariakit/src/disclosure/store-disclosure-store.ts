import { useMemo } from "react";
import {
  DisclosureStore as CoreDisclosureStore,
  DisclosureStoreProps as CoreDisclosureStoreProps,
  DisclosureStoreState,
  createDisclosureStore,
} from "ariakit-core/disclosure/disclosure-store";
import { useEvent } from "ariakit-react-utils/hooks";
import {
  ParentStore,
  Store,
  useStore,
  useStoreSync,
} from "ariakit-react-utils/store2";

export function useDisclosureStore(
  props: DisclosureStoreProps = {}
): DisclosureStore {
  const store = useStore(() =>
    createDisclosureStore({
      open: props.open ?? props.getState?.().open ?? props.defaultOpen,
      animated: props.animated ?? props.getState?.().animated,
    })
  );

  useStoreSync(store, props, "open", "setOpen");
  useStoreSync(store, props, "animated");
  useStoreSync(store, props, "animating");

  const setOpen = useEvent(store.setOpen);
  const show = useEvent(store.show);
  const hide = useEvent(store.hide);
  const toggle = useEvent(store.toggle);
  const stopAnimation = useEvent(store.stopAnimation);
  const setContentElement = useEvent(store.setContentElement);
  const setDisclosureElement = useEvent(store.setDisclosureElement);

  return useMemo(
    () => ({
      ...store,
      setOpen,
      show,
      hide,
      toggle,
      stopAnimation,
      setContentElement,
      setDisclosureElement,
    }),
    []
  );
}

export type { DisclosureStoreState };

export type DisclosureStoreProps = CoreDisclosureStoreProps &
  ParentStore<DisclosureStoreState> & {
    defaultOpen?: DisclosureStoreState["open"];
    setOpen?: (open: DisclosureStoreState["open"]) => void;
  };

export type DisclosureStore = Store<CoreDisclosureStore>;
