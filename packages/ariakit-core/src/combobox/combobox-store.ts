import type {
  CompositeStoreFunctions,
  CompositeStoreItem,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { createCompositeStore } from "../composite/composite-store.js";
import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.js";
import { createPopoverStore } from "../popover/popover-store.js";
import { defaultValue } from "../utils/misc.js";
import { isSafari, isTouchDevice } from "../utils/platform.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import {
  batch,
  createStore,
  setup,
  sync,
  throwOnConflictingProps,
} from "../utils/store.js";
import type { SetState } from "../utils/types.js";

type Item = CompositeStoreItem & {
  value?: string;
};

const isSafariOnMobile = isSafari() && isTouchDevice();

/**
 * Creates a combobox store.
 */
export function createComboboxStore(
  props: ComboboxStoreProps = {},
): ComboboxStore {
  throwOnConflictingProps(props, props.store);

  const syncState = props.store?.getState();

  const activeId = defaultValue(
    props.activeId,
    syncState?.activeId,
    props.defaultActiveId,
    null,
  );

  const composite = createCompositeStore({
    ...props,
    activeId,
    includesBaseElement: defaultValue(
      props.includesBaseElement,
      syncState?.includesBaseElement,
      true,
    ),
    orientation: defaultValue(
      props.orientation,
      syncState?.orientation,
      "vertical" as const,
    ),
    focusLoop: defaultValue(props.focusLoop, syncState?.focusLoop, true),
    focusWrap: defaultValue(props.focusWrap, syncState?.focusWrap, true),
    virtualFocus: defaultValue(
      props.virtualFocus,
      syncState?.virtualFocus,
      !isSafariOnMobile,
    ),
  });

  const popover = createPopoverStore({
    ...props,
    placement: defaultValue(
      props.placement,
      syncState?.placement,
      "bottom-start" as const,
    ),
  });

  const initialValue = defaultValue(
    props.value,
    syncState?.value,
    props.defaultValue,
    "",
  );

  const initialState: ComboboxStoreState = {
    ...composite.getState(),
    ...popover.getState(),
    value: initialValue,
    resetValueOnHide: defaultValue(
      props.resetValueOnHide,
      syncState?.resetValueOnHide,
      false,
    ),
    activeValue: syncState?.activeValue,
  };

  const combobox = createStore(initialState, composite, popover, props.store);

  setup(combobox, () =>
    sync(combobox, ["resetValueOnHide", "mounted"], (state) => {
      if (!state.resetValueOnHide) return;
      if (state.mounted) return;
      combobox.setState("value", initialValue);
    }),
  );

  // Resets the state when the combobox popover is hidden.
  setup(combobox, () =>
    batch(combobox, ["mounted"], (state) => {
      if (state.mounted) return;
      combobox.setState("activeId", activeId);
      combobox.setState("moves", 0);
    }),
  );

  // When the activeId changes, but the moves count doesn't, we reset the
  // activeValue state. This is useful when the activeId changes because of
  // a mouse move interaction.
  setup(combobox, () =>
    sync(combobox, ["moves", "activeId"], (state, prevState) => {
      if (state.moves === prevState.moves) {
        combobox.setState("activeValue", undefined);
      }
    }),
  );

  // Otherwise, if the moves count changes, we update the activeValue state.
  setup(combobox, () =>
    batch(combobox, ["moves", "renderedItems"], (state, prev) => {
      if (state.moves === prev.moves) return;
      const { activeId } = combobox.getState();
      const activeItem = composite.item(activeId);
      combobox.setState("activeValue", activeItem?.value);
    }),
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
   * - [Combobox filtering](https://ariakit.org/examples/combobox-filtering)
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
