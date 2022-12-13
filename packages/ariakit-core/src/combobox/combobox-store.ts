import {
  CompositeStoreFunctions,
  CompositeStoreItem,
  CompositeStoreOptions,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store";
import { MenuStore } from "../menu/menu-store";
import {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
  createPopoverStore,
} from "../popover/popover-store";
import { SelectStore } from "../select/select-store";
import { defaultValue } from "../utils/misc";
import { isSafari, isTouchDevice } from "../utils/platform";
import {
  Store,
  StoreOptions,
  StoreProps,
  createStore,
  mergeStore,
} from "../utils/store";
import { SetState } from "../utils/types";

type Item = CompositeStoreItem & {
  value?: string;
};

const isSafariOnMobile = isSafari() && isTouchDevice();

export function createComboboxStore({
  menu,
  select,
  ...props
}: ComboboxStoreProps = {}): ComboboxStore {
  const menuStore = menu?.omit(
    "anchorElement",
    "baseElement",
    "contentElement",
    "popoverElement"
  );

  const selectStore = select?.omit(
    "value",
    "anchorElement",
    "baseElement",
    "contentElement",
    "popoverElement",
    "items",
    "renderedItems"
  );

  const store = mergeStore(props.store, menuStore, selectStore);
  const syncState = store.getState();

  const activeId = defaultValue(props.activeId, syncState.activeId, null);

  const composite = createCompositeStore({
    ...props,
    store,
    activeId,
    includesBaseElement: defaultValue(
      props.includesBaseElement,
      syncState.includesBaseElement,
      true
    ),
    orientation: defaultValue(
      props.orientation,
      syncState.orientation,
      "vertical" as const
    ),
    focusLoop: defaultValue(props.focusLoop, syncState.focusLoop, true),
    focusWrap: defaultValue(props.focusWrap, syncState.focusWrap, true),
    virtualFocus: defaultValue(
      props.virtualFocus,
      syncState?.virtualFocus,
      !isSafariOnMobile
    ),
  });

  const popover = createPopoverStore({
    ...props,
    store,
    placement: defaultValue(
      props.placement,
      syncState.placement,
      "bottom-start" as const
    ),
  });

  const initialState: ComboboxStoreState = {
    ...composite.getState(),
    ...popover.getState(),
    value: defaultValue(props.value, syncState.value, props.defaultValue, ""),
    resetValueOnHide: defaultValue(
      props.resetValueOnHide,
      syncState.resetValueOnHide,
      false
    ),
    activeValue: syncState.activeValue,
  };

  const combobox = createStore(initialState, composite, popover);

  combobox.setup(() =>
    combobox.sync(
      (state) => {
        if (state.open) return;
        composite.setActiveId(activeId);
        composite.setMoves(0);
      },
      ["open"]
    )
  );
  combobox.setup(() =>
    combobox.sync(
      (state, prevState) => {
        if (state.moves === prevState.moves) {
          combobox.setState("activeValue", undefined);
        }
      },
      ["moves", "activeId"]
    )
  );
  combobox.setup(() =>
    combobox.sync(() => {
      const { activeId } = combobox.getState();
      const activeItem = composite.item(activeId);
      combobox.setState("activeValue", activeItem?.value);
    }, ["moves", "renderedItems"])
  );
  combobox.setup(() =>
    combobox.sync(
      (state) => {
        if (!state.resetValueOnHide) return;
        if (state.mounted) return;
        combobox.setState("value", props.value ?? "");
      },
      ["resetValueOnHide", "mounted"]
    )
  );

  return {
    ...popover,
    ...composite,
    ...combobox,
    setValue: (value) => combobox.setState("value", value),
  };
}

export type ComboboxStoreItem = Item;

export type ComboboxStoreState = CompositeStoreState<Item> &
  PopoverStoreState & {
    /**
     * The input value.
     */
    value: string;
    /**
     * The value of the current active item when `moveType` is `keyboard`. This
     * is not updated when `moveType` is `mouse`.
     */
    activeValue?: string;
    /**
     * TODO: Description
     */
    resetValueOnHide: boolean;
  };

export type ComboboxStoreFunctions = CompositeStoreFunctions<Item> &
  PopoverStoreFunctions & {
    /**
     * Sets the `value` state.
     */
    setValue: SetState<ComboboxStoreState["value"]>;
  };

export type ComboboxStoreOptions = CompositeStoreOptions<Item> &
  PopoverStoreOptions &
  StoreOptions<ComboboxStoreState, "value" | "resetValueOnHide"> & {
    menu?: MenuStore;
    select?: SelectStore;
    defaultValue?: ComboboxStoreState["value"];
  };

export type ComboboxStoreProps = ComboboxStoreOptions &
  StoreProps<ComboboxStoreState>;

export type ComboboxStore = ComboboxStoreFunctions & Store<ComboboxStoreState>;
