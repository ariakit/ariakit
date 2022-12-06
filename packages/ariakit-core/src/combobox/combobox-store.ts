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
import { isSafari, isTouchDevice } from "../utils/platform";
import { Store, StoreOptions, StoreProps, createStore } from "../utils/store";
import { SetState } from "../utils/types";

type Item = CompositeStoreItem & {
  value?: string;
};

const isSafariOnMobile = isSafari() && isTouchDevice();

export function createComboboxStore({
  menu,
  select,
  placement = "bottom-start",
  activeId = null,
  includesBaseElement = true,
  orientation = "vertical",
  focusLoop = true,
  focusWrap = true,
  virtualFocus = !isSafariOnMobile,
  value = "",
  resetValueOnHide = false,
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
  const composite = createCompositeStore({
    activeId,
    includesBaseElement,
    orientation,
    focusLoop,
    focusWrap,
    virtualFocus,
    ...props,
  });
  const popover = createPopoverStore({ placement, ...props });
  const initialState: ComboboxStoreState = {
    ...composite.getState(),
    ...popover.getState(),
    value,
    resetValueOnHide,
    activeValue: undefined,
  };
  const combobox = createStore(
    initialState,
    composite,
    popover,
    menuStore,
    selectStore
  );

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
        combobox.setState("value", value);
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
  };

export type ComboboxStoreProps = ComboboxStoreOptions &
  StoreProps<ComboboxStoreState>;

export type ComboboxStore = ComboboxStoreFunctions & Store<ComboboxStoreState>;
