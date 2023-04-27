import type {
  CompositeStoreFunctions,
  CompositeStoreItem,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { createCompositeStore } from "../composite/composite-store.js";
import type { MenuStore } from "../menu/menu-store.js";
import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.js";
import { createPopoverStore } from "../popover/popover-store.js";
import type { SelectStore } from "../select/select-store.js";
import { defaultValue } from "../utils/misc.js";
import { isSafari, isTouchDevice } from "../utils/platform.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import { createStore, mergeStore } from "../utils/store.js";
import type { SetState } from "../utils/types.js";

type Item = CompositeStoreItem & {
  value?: string;
};

const isSafariOnMobile = isSafari() && isTouchDevice();

/**
 * Creates a combobox store.
 */
export function createComboboxStore({
  menu,
  select,
  ...props
}: ComboboxStoreProps = {}): ComboboxStore {
  const store = mergeStore(
    props.store,
    menu?.omit(
      "baseElement",
      "arrowElement",
      "anchorElement",
      "contentElement",
      "popoverElement",
      "disclosureElement"
    ),
    select?.omit(
      "value",
      "items",
      "renderedItems",
      "baseElement",
      "arrowElement",
      "anchorElement",
      "contentElement",
      "popoverElement",
      "disclosureElement"
    )
  );

  const syncState = store.getState();

  const activeId = defaultValue(
    props.activeId,
    syncState.activeId,
    props.defaultActiveId,
    null
  );

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

  const initialValue = defaultValue(
    props.value,
    syncState.value,
    props.defaultValue,
    ""
  );

  const initialState: ComboboxStoreState = {
    ...composite.getState(),
    ...popover.getState(),
    value: initialValue,
    resetValueOnHide: defaultValue(
      props.resetValueOnHide,
      syncState.resetValueOnHide,
      false
    ),
    activeValue: syncState.activeValue,
  };

  const combobox = createStore(initialState, composite, popover, store);

  combobox.setup(() =>
    combobox.sync(
      (state) => {
        if (!state.resetValueOnHide) return;
        if (state.mounted) return;
        combobox.setState("value", initialValue);
      },
      ["resetValueOnHide", "mounted"]
    )
  );

  // Resets the state when the combobox popover is hidden.
  combobox.setup(() =>
    combobox.syncBatch(
      (state) => {
        if (state.mounted) return;
        combobox.setState("activeId", activeId);
        combobox.setState("moves", 0);
      },
      ["mounted"]
    )
  );

  // When the activeId changes, but the moves count doesn't, we reset the
  // activeValue state. This is useful when the activeId changes because of
  // a mouse move interaction.
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

  // Otherwise, if the moves count changes, we update the activeValue state.
  combobox.setup(() =>
    combobox.syncBatch(
      (state, prev) => {
        if (state.moves === prev.moves) return;
        const { activeId } = combobox.getState();
        const activeItem = composite.item(activeId);
        combobox.setState("activeValue", activeItem?.value);
      },
      ["moves", "renderedItems"]
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

export interface ComboboxStoreState
  extends CompositeStoreState<Item>,
    PopoverStoreState {
  /**
   * @default true
   */
  includesBaseElement: boolean;
  /**
   * The input value.
   *
   * Live examples:
   * - [ComboboxGroup](https://ariakit.org/examples/combobox-group)
   * - [Combobox with links](https://ariakit.org/examples/combobox-links)
   * - [Filterable Combobox](https://ariakit.org/examples/combobox-matches)
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   */
  value: string;
  /**
   * The value of the current active item.
   */
  activeValue: string | undefined;
  /**
   * Whether to reset the value when the combobox popover is hidden.
   *
   * Live examples:
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   * @default false
   */
  resetValueOnHide: boolean;
}

export interface ComboboxStoreFunctions
  extends CompositeStoreFunctions<Item>,
    PopoverStoreFunctions {
  /**
   * Sets the `value` state.
   *
   * Live examples:
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * @example
   * store.setValue("Hello world");
   * store.setValue((value) => value + "!");
   */
  setValue: SetState<ComboboxStoreState["value"]>;
}

export interface ComboboxStoreOptions
  extends StoreOptions<
      ComboboxStoreState,
      "includesBaseElement" | "value" | "resetValueOnHide"
    >,
    CompositeStoreOptions<Item>,
    PopoverStoreOptions {
  /**
   * @default null
   */
  defaultActiveId?: CompositeStoreOptions<Item>["activeId"];
  /**
   * A reference to a menu store. This is used when combining the combobox with
   * a menu (e.g., dropdown menu with a search input). The stores will share the
   * same state.
   */
  menu?: MenuStore;
  /**
   * A reference to a select store. This is used when combining the combobox
   * with a select (e.g., select with a search input). The stores will share the
   * same state.
   */
  select?: SelectStore;
  /**
   * The combobox initial value.
   *
   * Live examples:
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   * @default ""
   */
  defaultValue?: ComboboxStoreState["value"];
}

export type ComboboxStoreProps = ComboboxStoreOptions &
  StoreProps<ComboboxStoreState>;

export type ComboboxStore = ComboboxStoreFunctions & Store<ComboboxStoreState>;
