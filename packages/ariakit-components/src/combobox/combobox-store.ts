import {
  batch,
  createStore,
  mergeStore,
  pick,
  setup,
  sync,
  throwOnConflictingProps,
} from "@ariakit/store";
import type { Store, StoreOptions, StoreProps } from "@ariakit/store";
import { chain, defaultValue, isSafari, isTouchDevice } from "@ariakit/utils";
import type { PickRequired, SetState } from "@ariakit/utils";
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

  let shouldSetDefaultSelectedValue =
    props.selectedValue === undefined &&
    syncState?.selectedValue === undefined &&
    tagState?.values === undefined &&
    props.defaultSelectedValue === undefined;

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
    setSelectedValueOnMove: defaultValue(
      props.setSelectedValueOnMove,
      syncState?.setSelectedValueOnMove,
      false,
    ),
    activeValue: syncState?.activeValue,
    inputElement: defaultValue(syncState?.inputElement, null),
    labelElement: defaultValue(syncState?.labelElement, null),
    listElement: defaultValue(syncState?.listElement, null),
    selectElement: defaultValue(syncState?.selectElement, null),
    selectLabelElement: defaultValue(syncState?.selectLabelElement, null),
  };

  const combobox = createStore(initialState, composite, popover, store);
  let resolveSelectedItemOnOpen = false;
  let selectCompositeState: Pick<
    ComboboxStoreState,
    "focusLoop" | "focusWrap" | "includesBaseElement"
  > | null = null;
  const defaultSelectFocusLoop =
    props.focusLoop === undefined && syncState?.focusLoop === undefined;
  const defaultSelectFocusWrap =
    props.focusWrap === undefined && syncState?.focusWrap === undefined;
  const defaultSelectIncludesBaseElement =
    props.includesBaseElement === undefined &&
    syncState?.includesBaseElement === undefined;
  let syncedSelectElement =
    initialState.baseElement === initialState.selectElement
      ? initialState.selectElement
      : null;
  const initialFallback =
    initialState.selectElement ||
    initialState.baseElement ||
    initialState.disclosureElement;
  let syncedAnchorElement =
    initialState.anchorElement === initialFallback
      ? initialState.anchorElement
      : null;

  setup(combobox, () =>
    sync(combobox, ["baseElement", "selectElement"], (state) => {
      if (!state.selectElement && !syncedSelectElement) return;
      if (state.baseElement && state.baseElement === state.selectElement) {
        syncedSelectElement = state.selectElement;
        return;
      }
      if (state.baseElement && state.baseElement !== syncedSelectElement) {
        syncedSelectElement = null;
        return;
      }
      syncedSelectElement = state.selectElement;
      combobox.setState("baseElement", syncedSelectElement);
    }),
  );

  setup(combobox, () =>
    sync(
      combobox,
      ["focusLoop", "focusWrap", "includesBaseElement", "selectElement"],
      (state, prevState) => {
        if (
          state.selectElement &&
          (!prevState.selectElement || !selectCompositeState)
        ) {
          selectCompositeState = {
            focusLoop: state.focusLoop,
            focusWrap: state.focusWrap,
            includesBaseElement: state.includesBaseElement,
          };
          if (defaultSelectFocusLoop) {
            composite.setState("focusLoop", false);
          }
          if (defaultSelectFocusWrap) {
            composite.setState("focusWrap", false);
          }
          if (defaultSelectIncludesBaseElement) {
            composite.setState("includesBaseElement", false);
          }
          return;
        }
        if (state.selectElement || !prevState.selectElement) return;
        const previousState = selectCompositeState;
        selectCompositeState = null;
        if (!previousState) return;
        if (defaultSelectFocusLoop && !state.focusLoop) {
          composite.setState("focusLoop", previousState.focusLoop);
        }
        if (defaultSelectFocusWrap && !state.focusWrap) {
          composite.setState("focusWrap", previousState.focusWrap);
        }
        if (defaultSelectIncludesBaseElement && !state.includesBaseElement) {
          composite.setState(
            "includesBaseElement",
            previousState.includesBaseElement,
          );
        }
      },
    ),
  );

  setup(combobox, () =>
    sync(
      combobox,
      ["anchorElement", "baseElement", "disclosureElement", "selectElement"],
      (state) => {
        if (
          state.anchorElement &&
          state.anchorElement !== syncedAnchorElement
        ) {
          syncedAnchorElement = null;
          return;
        }
        const fallback =
          state.selectElement || state.baseElement || state.disclosureElement;
        syncedAnchorElement = fallback;
        combobox.setState("anchorElement", syncedAnchorElement);
      },
    ),
  );

  setup(combobox, () =>
    sync(
      combobox,
      ["items", "listElement", "selectedValue", "selectElement"],
      (state, prevState) => {
        if (!shouldSetDefaultSelectedValue) return;
        if (state.selectedValue !== prevState.selectedValue) {
          shouldSetDefaultSelectedValue = false;
          return;
        }
        queueMicrotask(() => {
          if (!shouldSetDefaultSelectedValue) return;
          const state = combobox.getState();
          if (!state.selectElement && !state.listElement) return;
          const item = state.items.find(
            (item) => !item.disabled && item.value != null,
          );
          if (item?.value == null) return;
          shouldSetDefaultSelectedValue = false;
          combobox.setState("selectedValue", item.value);
        });
      },
    ),
  );

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
      if (state.open) {
        resolveSelectedItemOnOpen = true;
        return;
      }
      resolveSelectedItemOnOpen = false;
      combobox.setState("activeId", activeId);
      combobox.setState("moves", 0);
    }),
  );

  setup(combobox, () =>
    sync(combobox, ["moves"], () => {
      if (!combobox.getState().open) return;
      resolveSelectedItemOnOpen = false;
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

  setup(combobox, () =>
    sync(
      combobox,
      ["items", "mounted", "open", "selectedValue", "selectElement"],
      (state) => {
        if (!state.selectElement) return;
        if (state.mounted && !resolveSelectedItemOnOpen) return;
        const values = Array.isArray(state.selectedValue)
          ? state.selectedValue
          : [state.selectedValue];
        const lastValue = values[values.length - 1];
        if (lastValue == null) return;
        const item = state.items.find(
          (item) => !item.disabled && item.value === lastValue,
        );
        if (!item) return;
        resolveSelectedItemOnOpen = false;
        combobox.setState("activeId", item.id);
      },
    ),
  );

  const setSelectedValueFromActiveItem = () => {
    const { activeId, moves } = composite.getState();
    const { open, selectedValue, selectElement, setSelectedValueOnMove } =
      combobox.getState();
    if (!selectElement) return;
    if (!setSelectedValueOnMove && open) return;
    if (Array.isArray(selectedValue)) return;
    if (!moves) return;
    if (!activeId) return;
    const item = composite.item(activeId);
    if (!item || item.disabled || item.value == null) return;
    combobox.setState("selectedValue", item.value);
  };

  setup(combobox, () =>
    chain(
      batch(composite, ["moves"], setSelectedValueFromActiveItem),
      batch(combobox, ["setSelectedValueOnMove"], () => {
        setSelectedValueFromActiveItem();
      }),
    ),
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
    setInputElement: (element) => combobox.setState("inputElement", element),
    setLabelElement: (element) => combobox.setState("labelElement", element),
    setListElement: (element) => combobox.setState("listElement", element),
    setSelectElement: (element) => combobox.setState("selectElement", element),
    setSelectLabelElement: (element) =>
      combobox.setState("selectLabelElement", element),
  };
}

export type ComboboxStoreSelectedValue = string | readonly string[];

export interface ComboboxStoreItem extends CompositeStoreItem {
  value?: string;
}

export interface ComboboxStoreState<
  T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue,
>
  extends CompositeStoreState<ComboboxStoreItem>, PopoverStoreState {
  /** @default true, or false when `ComboboxSelect` is rendered */
  includesBaseElement: CompositeStoreState<ComboboxStoreItem>["includesBaseElement"];
  /** @default true, or false when `ComboboxSelect` is rendered */
  focusLoop: CompositeStoreState<ComboboxStoreItem>["focusLoop"];
  /** @default true, or false when `ComboboxSelect` is rendered */
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
   *   filter](https://ariakit.com/examples/combobox-filtering-integrated)
   * - [Combobox with links](https://ariakit.com/examples/combobox-links)
   * - [Combobox filtering](https://ariakit.com/examples/combobox-filtering)
   * - [Multi-selectable
   *   Combobox](https://ariakit.com/examples/combobox-multiple)
   * - [Textarea with inline
   *   Combobox](https://ariakit.com/examples/combobox-textarea)
   * - [Command Menu with
   *   Tabs](https://ariakit.com/examples/dialog-combobox-tab-command-menu)
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
   * [multi-selectable](https://ariakit.com/examples/combobox-multiple).
   *
   * Live examples:
   * - [Multi-selectable
   *   Combobox](https://ariakit.com/examples/combobox-multiple)
   */
  selectedValue: MutableValue<T>;
  /**
   * Whether the combobox
   * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
   * should be set when the active item changes by moving while
   * [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) is open.
   * The selected value is always updated when moving while the select is
   * closed.
   * @default false
   */
  setSelectedValueOnMove: boolean;
  /**
   * Whether to reset the value when the combobox popover closes. This prop is
   * automatically set to `true` by default if the combobox supports multiple
   * selections. In other words, if the
   * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
   * or
   * [`defaultSelectedValue`](https://ariakit.com/reference/combobox-provider#defaultselectedvalue)
   * props are arrays. However, when the combobox is connected to a
   * [`tag`](https://ariakit.com/reference/combobox-provider#tag) store, the
   * default is `false` so the input value is kept when the popover closes.
   *
   * Live examples:
   * - [Multi-selectable
   *   Combobox](https://ariakit.com/examples/combobox-multiple)
   * - [Menu with Combobox](https://ariakit.com/examples/menu-combobox)
   * - [Select with Combobox](https://ariakit.com/examples/select-combobox)
   * - [Submenu with
   *   Combobox](https://ariakit.com/examples/menu-nested-combobox)
   * - [Command Menu with
   *   Tabs](https://ariakit.com/examples/dialog-combobox-tab-command-menu)
   * - [Select with Combobox and
   *   Tabs](https://ariakit.com/examples/select-combobox-tab)
   */
  resetValueOnHide: boolean;
  /**
   * Whether to reset the value when an item is selected. This prop is
   * automatically set to `true` by default if the combobox supports multiple
   * selections. In other words, if the
   * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
   * or
   * [`defaultSelectedValue`](https://ariakit.com/reference/combobox-provider#defaultselectedvalue)
   * props are arrays.
   * @deprecated Use the
   * [`resetValueOnSelect`](https://ariakit.com/reference/combobox-item#resetvalueonselect)
   * prop on [`ComboboxItem`](https://ariakit.com/reference/combobox-item)
   * instead.
   */
  resetValueOnSelect: boolean;
  /**
   * The combobox input element.
   */
  inputElement: HTMLElement | null;
  /**
   * The combobox input label element.
   */
  labelElement: HTMLElement | null;
  /**
   * The standalone combobox list element.
   */
  listElement: HTMLElement | null;
  /**
   * The combobox select element.
   */
  selectElement: HTMLElement | null;
  /**
   * The combobox select label element.
   */
  selectLabelElement: HTMLElement | null;
}

export interface ComboboxStoreFunctions<
  T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue,
>
  extends
    Pick<ComboboxStoreOptions<T>, "tag">,
    CompositeStoreFunctions<ComboboxStoreItem>,
    PopoverStoreFunctions {
  /**
   * Sets the [`value`](https://ariakit.com/reference/combobox-provider#value)
   * state.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.com/examples/combobox-textarea)
   * @example
   * store.setValue("Hello world");
   * store.setValue((value) => value + "!");
   */
  setValue: SetState<ComboboxStoreState<T>["value"]>;
  /**
   * Resets the [`value`](https://ariakit.com/reference/combobox-provider#value)
   * state to its initial value.
   */
  resetValue: () => void;
  /**
   * Sets the
   * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
   * state.
   */
  setSelectedValue: SetState<ComboboxStoreState<T>["selectedValue"]>;
  /**
   * Sets the `inputElement` state.
   */
  setInputElement: SetState<ComboboxStoreState<T>["inputElement"]>;
  /**
   * Sets the `labelElement` state.
   */
  setLabelElement: SetState<ComboboxStoreState<T>["labelElement"]>;
  /**
   * Sets the `listElement` state.
   */
  setListElement: SetState<ComboboxStoreState<T>["listElement"]>;
  /**
   * Sets the `selectElement` state.
   */
  setSelectElement: SetState<ComboboxStoreState<T>["selectElement"]>;
  /**
   * Sets the `selectLabelElement` state.
   */
  setSelectLabelElement: SetState<ComboboxStoreState<T>["selectLabelElement"]>;
}

export interface ComboboxStoreOptions<
  T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue,
>
  extends
    StoreOptions<
      ComboboxStoreState<T>,
      | "includesBaseElement"
      | "focusLoop"
      | "focusWrap"
      | "orientation"
      | "virtualFocus"
      | "value"
      | "selectedValue"
      | "setSelectedValueOnMove"
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
   * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
   * state. This can be a string or an array of strings. If it's an array, the
   * combobox is considered
   * [multi-selectable](https://ariakit.com/examples/combobox-multiple).
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
>
  extends ComboboxStoreOptions<T>, StoreProps<ComboboxStoreState<T>> {}

export interface ComboboxStore<
  T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue,
>
  extends ComboboxStoreFunctions<T>, Store<ComboboxStoreState<T>> {}
