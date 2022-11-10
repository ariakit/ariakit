import {
  ComboboxStoreState,
  ComboboxStore as CoreComboboxStore,
  ComboboxStoreProps as CoreComboboxStoreProps,
  createComboboxStore,
} from "ariakit-core/combobox/combobox-store";
import { useEvent } from "ariakit-react-utils/hooks";
import {
  ParentStore,
  Store,
  useStore,
  useStoreSync,
} from "ariakit-react-utils/store2";

export function useComboboxStore(
  props: ComboboxStoreProps = {}
): ComboboxStore {
  const getAnchorRect = useEvent(props.getAnchorRect);
  const renderCallback = useEvent(props.renderCallback);
  const store = useStore(() =>
    createComboboxStore({
      ...props.getState?.(),
      ...props,
      value: props.value ?? props.getState?.()?.value ?? props.defaultValue,
      items: props.items ?? props.getState?.()?.items ?? props.defaultItems,
      activeId:
        props.activeId ?? props.getState?.()?.activeId ?? props.defaultActiveId,
      open: props.open ?? props.getState?.().open ?? props.defaultOpen,
      getAnchorRect: props.getAnchorRect ? getAnchorRect : undefined,
      renderCallback: props.renderCallback ? renderCallback : undefined,
    })
  );

  useStoreSync(store, props, "open", "setOpen");
  useStoreSync(store, props, "animated");
  useStoreSync(store, props, "animating");
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

  useStoreSync(store, props, "items", "setItems");
  useStoreSync(store, props, "activeId", "setActiveId");
  useStoreSync(store, props, "includesBaseElement");
  useStoreSync(store, props, "virtualFocus");
  useStoreSync(store, props, "orientation");
  useStoreSync(store, props, "rtl");
  useStoreSync(store, props, "focusLoop");
  useStoreSync(store, props, "focusWrap");
  useStoreSync(store, props, "focusShift");
  useStoreSync(store, props, "moves");

  useStoreSync(store, props, "value", "setValue");

  return store;
}

export type { ComboboxStoreState };

export type ComboboxStoreProps = CoreComboboxStoreProps &
  ParentStore<ComboboxStoreState> & {
    defaultOpen?: ComboboxStoreState["open"];
    setOpen?: (open: ComboboxStoreState["open"]) => void;
    defaultItems?: ComboboxStoreState["items"];
    setItems?: (items: ComboboxStoreState["items"]) => void;
    defaultActiveId?: ComboboxStoreState["activeId"];
    setActiveId?: (activeId: ComboboxStoreState["activeId"]) => void;
    setMoves?: (moves: ComboboxStoreState["moves"]) => void;
    defaultValue?: ComboboxStoreState["value"];
    setValue?: (value: ComboboxStoreState["value"]) => void;
  };

export type ComboboxStore = Store<CoreComboboxStore>;
