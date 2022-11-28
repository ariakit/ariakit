import {
  CompositeStore,
  CompositeStoreItem,
  CompositeStoreProps,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store";
import { MenuStore } from "../menu/menu-store";
import {
  PopoverStore,
  PopoverStoreProps,
  PopoverStoreState,
  createPopoverStore,
} from "../popover/popover-store";
import { chain } from "../utils/misc";
import { isSafari, isTouchDevice } from "../utils/platform";
import { PartialStore, Store, createStore } from "../utils/store";
import { SetState } from "../utils/types";

const isSafariOnMobile = isSafari() && isTouchDevice();

function isMenuStoreProps<T extends ComboboxStoreProps>(
  props: T
): props is T & Pick<MenuStore, "omit"> {
  if (!props.omit) return false;
  if (!props.getState) return false;
  const state = props.getState();
  return "initialFocus" in state && "values" in state;
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
  const popover = createPopoverStore({ placement, ...props });
  const composite = createCompositeStore({
    activeId,
    includesBaseElement,
    orientation,
    focusLoop,
    focusWrap,
    virtualFocus,
    ...props,
  });
  const initialState: ComboboxStoreState = {
    ...popover.getState(),
    ...composite.getState(),
    activeValue: undefined,
    value,
  };
  const store = createStore(initialState, composite, popover);

  const setup = () => {
    return chain(
      store.setup(),
      store.sync(
        (state) => {
          if (state.open) return;
          composite.setActiveId(activeId);
          composite.setMoves(0);
        },
        ["open"]
      ),
      store.sync(
        (state, prevState) => {
          if (state.moves === prevState.moves) {
            store.setState("activeValue", undefined);
          }
        },
        ["moves", "activeId"]
      ),
      store.sync(() => {
        const { activeId } = store.getState();
        const activeItem = composite.item(activeId);
        store.setState("activeValue", activeItem?.value);
      }, ["moves", "renderedItems"])
    );
  };

  return {
    ...popover,
    ...composite,
    ...store,
    setup,
    setValue: (value) => store.setState("value", value),
  };
}

export type ComboboxStoreItem = CompositeStoreItem & {
  value?: string;
};

export type ComboboxStoreState = CompositeStoreState<ComboboxStoreItem> &
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

export type ComboboxStore = Omit<
  CompositeStore<ComboboxStoreItem>,
  keyof Store
> &
  Omit<PopoverStore, keyof Store> &
  Store<ComboboxStoreState> & {
    /**
     * Sets the `value` state.
     */
    setValue: SetState<ComboboxStoreState["value"]>;
  };

export type ComboboxStoreProps = Omit<
  CompositeStoreProps<ComboboxStoreItem>,
  keyof ComboboxStore
> &
  Omit<PopoverStoreProps, keyof ComboboxStore> &
  PartialStore<ComboboxStoreState> &
  Partial<Pick<ComboboxStoreState, "value">>;
