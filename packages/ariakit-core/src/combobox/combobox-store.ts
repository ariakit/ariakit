import { chain } from "ariakit-utils/misc";
import { isSafari, isTouchDevice } from "ariakit-utils/platform";
import { Store, createStore } from "ariakit-utils/store";
import { SetState } from "ariakit-utils/types";
import {
  CompositeStore,
  CompositeStoreProps,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store";
import {
  PopoverStore,
  PopoverStoreProps,
  PopoverStoreState,
  createPopoverStore,
} from "../popover/popover-store";

type Item = CompositeStoreState["items"][number] & {
  value?: string;
};

const isSafariOnMobile = isSafari() && isTouchDevice();

export function createComboboxStore({
  value = "",
  activeId = null,
  includesBaseElement = true,
  orientation = "vertical",
  focusLoop = true,
  focusWrap = true,
  virtualFocus = !isSafariOnMobile,
  placement = "bottom-start",
  ...props
}: ComboboxStoreProps = {}): ComboboxStore {
  const popover = createPopoverStore({ placement, ...props });
  const composite = createCompositeStore(
    {
      activeId,
      includesBaseElement,
      orientation,
      focusLoop,
      focusWrap,
      virtualFocus,
      ...props,
    },
    popover
  );
  const store = createStore<ComboboxStoreState>(
    {
      activeValue: undefined,
      value,
      ...composite.getState(),
      ...popover.getState(),
    },
    composite
  );

  const setup = () => {
    return chain(
      store.setup?.(),
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

  const setValue: ComboboxStore["setValue"] = (value) => {
    store.setState("value", value);
  };

  return {
    ...popover,
    ...composite,
    ...store,
    setup,
    setValue,
  };
}

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

export type ComboboxStore = Omit<CompositeStore<Item>, keyof Store> &
  Omit<PopoverStore, keyof Store> &
  Store<ComboboxStoreState> & {
    /**
     * Sets the `value` state.
     * @example
     * const combobox = useComboboxState();
     * combobox.setValue("new value");
     */
    setValue: SetState<ComboboxStoreState["value"]>;
  };

export type ComboboxStoreProps = CompositeStoreProps<Item> &
  PopoverStoreProps &
  Partial<Pick<ComboboxStoreState, "value">>;
