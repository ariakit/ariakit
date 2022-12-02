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

function isMenuStoreProps<T extends ComboboxStoreProps>(
  props: T
): props is T & Pick<MenuStore, "omit"> {
  if (!props.omit) return false;
  if (!props.getState) return false;
  const state = props.getState();
  return "initialFocus" in state && "values" in state;
}

function isSelectStoreProps<T extends ComboboxStoreProps>(
  props: T
): props is T & Pick<SelectStore, "omit"> {
  if (!props.omit) return false;
  if (!props.getState) return false;
  const state = props.getState();
  return "value" in state && "setValueOnMove" in state;
}

export function createComboboxStore({
  placement = "bottom-start",
  activeId = null,
  includesBaseElement = true,
  orientation = "vertical",
  focusLoop = true,
  focusWrap = true,
  virtualFocus = !isSafariOnMobile,
  value = "",
  ...props
}: ComboboxStoreProps = {}): ComboboxStore {
  if (isMenuStoreProps(props)) {
    props = { ...props, ...props.omit("contentElement") };
  }
  if (isSelectStoreProps(props)) {
    props = { ...props, ...props.omit("value", "contentElement") };
  }
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
    activeValue: undefined,
    value,
  };
  const store = createStore(initialState, composite, popover);

  store.setup(() =>
    store.sync(
      (state) => {
        if (state.open) return;
        composite.setActiveId(activeId);
        composite.setMoves(0);
      },
      ["open"]
    )
  );
  store.setup(() =>
    store.sync(
      (state, prevState) => {
        if (state.moves === prevState.moves) {
          store.setState("activeValue", undefined);
        }
      },
      ["moves", "activeId"]
    )
  );
  store.setup(() =>
    store.sync(() => {
      const { activeId } = store.getState();
      const activeItem = composite.item(activeId);
      store.setState("activeValue", activeItem?.value);
    }, ["moves", "renderedItems"])
  );

  return {
    ...popover,
    ...composite,
    ...store,
    setValue: (value) => store.setState("value", value),
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
  StoreOptions<ComboboxStoreState, "value">;

export type ComboboxStoreProps = ComboboxStoreOptions &
  StoreProps<ComboboxStoreState>;

export type ComboboxStore = ComboboxStoreFunctions & Store<ComboboxStoreState>;
