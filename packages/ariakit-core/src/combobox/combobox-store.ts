import type {
  CompositeStoreFunctions,
  CompositeStoreItem,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.ts";
import { createCompositeStore } from "../composite/composite-store.ts";
import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.ts";
import { createPopoverStore } from "../popover/popover-store.ts";
import type { TagStore } from "../tag/tag-store.ts";
import { chain, defaultValue } from "../utils/misc.ts";
import { isSafari, isTouchDevice } from "../utils/platform.ts";
import type { Store, StoreOptions, StoreProps } from "../utils/store.ts";
import {
  batch,
  createStore,
  mergeStore,
  pick,
  setup,
  sync,
  throwOnConflictingProps,
} from "../utils/store.ts";
import type { PickRequired, SetState } from "../utils/types.ts";

type MutableValue<
  T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue,
> = T extends string ? string : T;

const isTouchSafari = isSafari() && isTouchDevice();

/**
 * Creates a combobox store.
 */
export function createComboboxStore<
  T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue,
>(
  props: PickRequired<
    ComboboxStoreProps<T>,
    "selectedValue" | "defaultSelectedValue"
  >,
): ComboboxStore<T>;

export function createComboboxStore(props?: ComboboxStoreProps): ComboboxStore;

export function createComboboxStore({
  tag,
  ...props
}: ComboboxStoreProps = {}): ComboboxStore {
  const store = mergeStore(props.store, pick(tag, ["value", "rtl"]));

  throwOnConflictingProps(props, store);

  const tagState = tag?.getState();
  const syncState = store?.getState();

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
      true,
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

  const value = defaultValue(
    props.value,
    syncState?.value,
    props.defaultValue,
    "",
  );

  const selectedValue = defaultValue(
    props.selectedValue,
    syncState?.selectedValue,
    tagState?.values,
    props.defaultSelectedValue,
    "",
  );

  const multiSelectable = Array.isArray(selectedValue);

  const initialState: ComboboxStoreState = {
    ...composite.getState(),
    ...popover.getState(),
    value,
    selectedValue,
    resetValueOnSelect: defaultValue(
      props.resetValueOnSelect,
      syncState?.resetValueOnSelect,
      multiSelectable,
    ),
    resetValueOnHide: defaultValue(
      props.resetValueOnHide,
      syncState?.resetValueOnHide,
      multiSelectable && !tag,
    ),
    activeValue: syncState?.activeValue,
  };

  const combobox = createStore(initialState, composite, popover, store);

  // Safari doesn't support aria-activedescendant on combobox elements. This is
  // particularly problematic when using touch devices as moving the VoiceOver
  // virtual cursor through the combobox items will always move the focus to the
  // input element. To work around this, we disable virtual focus on touch
  // devices when using Safari.
  if (isTouchSafari) {
    setup(combobox, () =>
      sync(combobox, ["virtualFocus"], () => {
        combobox.setState("virtualFocus", false);
      }),
    );
  }

  // Sync tag values with the combobox selectedValue state.
  setup(combobox, () => {
    if (!tag) return;
    return chain(
      sync(combobox, ["selectedValue"], (state) => {
        if (!Array.isArray(state.selectedValue)) return;
        tag.setValues(state.selectedValue);
      }),
      sync(tag, ["values"], (state) => {
        combobox.setState("selectedValue", state.values);
      }),
    );
  });

  setup(combobox, () =>
    sync(combobox, ["resetValueOnHide", "mounted"], (state) => {
      if (!state.resetValueOnHide) return;
      if (state.mounted) return;
      combobox.setState("value", value);
    }),
  );

  // Resets the state when the combobox popover is hidden.
  setup(combobox, () =>
    sync(combobox, ["open"], (state) => {
      if (state.open) return;
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
    tag,
    setValue: (value) => combobox.setState("value", value),
    resetValue: () => combobox.setState("value", initialState.value),
    setSelectedValue: (selectedValue) =>
      combobox.setState("selectedValue", selectedValue),
  };
}

export type ComboboxStoreSelectedValue = string | readonly string[];

export interface ComboboxStoreItem extends CompositeStoreItem {
  value?: string;
}

export interface ComboboxStoreState<
  T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue,
> extends CompositeStoreState<ComboboxStoreItem>,
    PopoverStoreState {
  /** @default true */
  includesBaseElement: CompositeStoreState<ComboboxStoreItem>["includesBaseElement"];
  /** @default true */
  focusLoop: CompositeStoreState<ComboboxStoreItem>["focusLoop"];
  /** @default true */
  focusWrap: CompositeStoreState<ComboboxStoreItem>["focusWrap"];
  /** @default "vertical" */
  orientation: CompositeStoreState<ComboboxStoreItem>["orientation"];
  /** @default true */
  virtualFocus: CompositeStoreState<ComboboxStoreItem>["virtualFocus"];
  /**
   * The combobox input value.
   *
   * Live examples:
   * - [Combobox with integrated
   *   filter](https://ariakit.org/examples/combobox-filtering-integrated)
   * - [Combobox with links](https://ariakit.org/examples/combobox-links)
   * - [Combobox filtering](https://ariakit.org/examples/combobox-filtering)
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * - [Command Menu with
   *   Tabs](https://ariakit.org/examples/dialog-combobox-tab-command-menu)
   */
  value: string;
  /**
   * The value of the currently active item. This state automatically updates as
   * the user navigates the combobox items either by keyboard or mouse click.
   * Note that it doesn't update when the user simply hovers over the items.
   */
  activeValue: string | undefined;
  /**
   * The value(s) of the currently selected item(s). This can be a string or an
   * array of strings. If it's an array, the combobox is considered
   * [multi-selectable](https://ariakit.org/examples/combobox-multiple).
   *
   * Live examples:
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   */
  selectedValue: MutableValue<T>;
  /**
   * Whether to reset the value when the combobox popover closes. This prop is
   * automatically set to `true` by default if the combobox supports multiple
   * selections. In other words, if the
   * [`selectedValue`](https://ariakit.org/reference/combobox-provider#selectedvalue)
   * or
   * [`defaultSelectedValue`](https://ariakit.org/reference/combobox-provider#defaultselectedvalue)
   * props are arrays.
   *
   * Live examples:
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   * - [Menu with Combobox](https://ariakit.org/examples/menu-combobox)
   * - [Select with Combobox](https://ariakit.org/examples/select-combobox)
   * - [Submenu with
   *   Combobox](https://ariakit.org/examples/menu-nested-combobox)
   * - [Command Menu with
   *   Tabs](https://ariakit.org/examples/dialog-combobox-tab-command-menu)
   * - [Select with Combobox and
   *   Tabs](https://ariakit.org/examples/select-combobox-tab)
   */
  resetValueOnHide: boolean;
  /**
   * Whether to reset the value when an item is selected. This prop is
   * automatically set to `true` by default if the combobox supports multiple
   * selections. In other words, if the
   * [`selectedValue`](https://ariakit.org/reference/combobox-provider#selectedvalue)
   * or
   * [`defaultSelectedValue`](https://ariakit.org/reference/combobox-provider#defaultselectedvalue)
   * props are arrays.
   * @deprecated Use the
   * [`resetValueOnSelect`](https://ariakit.org/reference/combobox-item#resetvalueonselect)
   * prop on [`ComboboxItem`](https://ariakit.org/reference/combobox-item)
   * instead.
   */
  resetValueOnSelect: boolean;
}

export interface ComboboxStoreFunctions<
  T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue,
> extends Pick<ComboboxStoreOptions<T>, "tag">,
    CompositeStoreFunctions<ComboboxStoreItem>,
    PopoverStoreFunctions {
  /**
   * Sets the [`value`](https://ariakit.org/reference/combobox-provider#value)
   * state.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * @example
   * store.setValue("Hello world");
   * store.setValue((value) => value + "!");
   */
  setValue: SetState<ComboboxStoreState<T>["value"]>;
  /**
   * Resets the [`value`](https://ariakit.org/reference/combobox-provider#value)
   * state to its initial value.
   */
  resetValue: () => void;
  /**
   * Sets the
   * [`selectedValue`](https://ariakit.org/reference/combobox-provider#selectedvalue)
   * state.
   */
  setSelectedValue: SetState<ComboboxStoreState<T>["selectedValue"]>;
}

export interface ComboboxStoreOptions<
  T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue,
> extends StoreOptions<
      ComboboxStoreState<T>,
      | "includesBaseElement"
      | "focusLoop"
      | "focusWrap"
      | "orientation"
      | "virtualFocus"
      | "value"
      | "selectedValue"
      | "resetValueOnHide"
      | "resetValueOnSelect"
    >,
    CompositeStoreOptions<ComboboxStoreItem>,
    PopoverStoreOptions {
  /** @default null */
  defaultActiveId?: CompositeStoreOptions<ComboboxStoreItem>["activeId"];
  /**
   * The initial value of the combobox input.
   * @default ""
   */
  defaultValue?: ComboboxStoreState<T>["value"];
  /**
   * The initial value of the
   * [`selectedValue`](https://ariakit.org/reference/combobox-provider#selectedvalue)
   * state. This can be a string or an array of strings. If it's an array, the
   * combobox is considered
   * [multi-selectable](https://ariakit.org/examples/combobox-multiple).
   * @default ""
   */
  defaultSelectedValue?: ComboboxStoreState<T>["selectedValue"];
  /**
   * A reference to a tag store. This is used when rendering a combobox within a
   * tag list. The stores will share the same state.
   */
  tag?: TagStore | null;
}

export interface ComboboxStoreProps<
  T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue,
> extends ComboboxStoreOptions<T>,
    StoreProps<ComboboxStoreState<T>> {}

export interface ComboboxStore<
  T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue,
> extends ComboboxStoreFunctions<T>,
    Store<ComboboxStoreState<T>> {}
