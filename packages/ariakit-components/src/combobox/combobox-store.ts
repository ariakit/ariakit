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
  const defaultInputValue = defaultValue(
    props.defaultInputValue,
    props.defaultValue,
  );

  throwOnConflictingProps(
    { ...props, defaultInputValue, defaultValue: defaultInputValue },
    store,
  );

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
    compositeElementInFocusOrder: defaultValue(
      props.compositeElementInFocusOrder,
      props.includesBaseElement,
      syncState?.compositeElementInFocusOrder,
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

  const inputValue = defaultValue(
    props.inputValue,
    props.value,
    syncState?.inputValue,
    syncState?.value,
    defaultInputValue,
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
    inputValue,
    value: inputValue,
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
    selectOnMove: defaultValue(
      props.selectOnMove,
      syncState?.selectOnMove,
      false,
    ),
    activeValue: syncState?.activeValue,
    inputElement: defaultValue(syncState?.inputElement, null),
    labelElement: defaultValue(syncState?.labelElement, null),
    selectElement: defaultValue(syncState?.selectElement, null),
    selectLabelElement: defaultValue(syncState?.selectLabelElement, null),
  };

  const combobox = createStore(initialState, composite, popover, store);
  setup(combobox, () =>
    chain(
      sync(combobox, ["inputValue"], (state) => {
        combobox.setState("value", state.inputValue);
      }),
      sync(combobox, ["value"], (state) => {
        combobox.setState("inputValue", state.value);
      }),
    ),
  );
  let resolveSelectedItemOnOpen = false;
  const selectDefaultOptions = new Set<keyof ComboboxStoreState>();
  if (props.focusLoop === undefined && syncState?.focusLoop === undefined) {
    selectDefaultOptions.add("focusLoop");
  }
  if (props.focusWrap === undefined && syncState?.focusWrap === undefined) {
    selectDefaultOptions.add("focusWrap");
  }
  if (
    props.compositeElementInFocusOrder === undefined &&
    props.includesBaseElement === undefined &&
    syncState?.compositeElementInFocusOrder === undefined &&
    syncState?.includesBaseElement === undefined
  ) {
    selectDefaultOptions.add("compositeElementInFocusOrder");
  }
  if (
    props.resetValueOnSelect === undefined &&
    syncState?.resetValueOnSelect === undefined
  ) {
    selectDefaultOptions.add("resetValueOnSelect");
  }
  let syncedSelectElement =
    initialState.compositeElement === initialState.selectElement
      ? initialState.selectElement
      : null;
  const initialFallback =
    initialState.selectElement ||
    initialState.compositeElement ||
    initialState.disclosureElement;
  let syncedAnchorElement =
    initialState.anchorElement === initialFallback
      ? initialState.anchorElement
      : null;

  // Use the select as the composite element until an input or explicit
  // composite element takes ownership. The input may mount after the select,
  // so this must stay in sync rather than being decided by the select ref alone.
  setup(combobox, () =>
    sync(combobox, ["compositeElement", "selectElement"], (state) => {
      if (!state.selectElement && !syncedSelectElement) return;
      if (
        state.compositeElement &&
        state.compositeElement === state.selectElement
      ) {
        syncedSelectElement = state.selectElement;
        return;
      }
      if (
        state.compositeElement &&
        state.compositeElement !== syncedSelectElement
      ) {
        syncedSelectElement = null;
        return;
      }
      syncedSelectElement = state.selectElement;
      combobox.setState("compositeElement", syncedSelectElement);
    }),
  );

  // Match native select navigation while a select is rendered. Explicit
  // composite options are never overridden, and listener cleanup restores the
  // previous defaults when this mode ends. The public setState below transfers
  // ownership before forwarding consumer writes, including no-op writes.
  setup(combobox, () =>
    sync(combobox, ["selectElement"], (state) => {
      if (!state.selectElement) return;
      const {
        focusLoop,
        focusWrap,
        compositeElementInFocusOrder,
        resetValueOnSelect,
      } = combobox.getState();
      if (selectDefaultOptions.has("focusLoop")) {
        composite.setState("focusLoop", false);
      }
      if (selectDefaultOptions.has("focusWrap")) {
        composite.setState("focusWrap", false);
      }
      if (selectDefaultOptions.has("compositeElementInFocusOrder")) {
        composite.setState("compositeElementInFocusOrder", false);
      }
      if (selectDefaultOptions.has("resetValueOnSelect")) {
        combobox.setState("resetValueOnSelect", true);
      }
      return () => {
        const current = combobox.getState();
        if (selectDefaultOptions.has("focusLoop") && !current.focusLoop) {
          composite.setState("focusLoop", focusLoop);
        }
        if (selectDefaultOptions.has("focusWrap") && !current.focusWrap) {
          composite.setState("focusWrap", focusWrap);
        }
        if (
          selectDefaultOptions.has("compositeElementInFocusOrder") &&
          !current.compositeElementInFocusOrder
        ) {
          composite.setState(
            "compositeElementInFocusOrder",
            compositeElementInFocusOrder,
          );
        }
        if (
          selectDefaultOptions.has("resetValueOnSelect") &&
          current.resetValueOnSelect
        ) {
          combobox.setState("resetValueOnSelect", resetValueOnSelect);
        }
      };
    }),
  );

  // Prefer the select as the popover anchor, then the composite element, then
  // the disclosure. Track only the fallback assigned here so an explicit
  // anchor keeps ownership.
  setup(combobox, () =>
    sync(
      combobox,
      [
        "anchorElement",
        "compositeElement",
        "disclosureElement",
        "selectElement",
      ],
      (state) => {
        if (
          state.anchorElement &&
          state.anchorElement !== syncedAnchorElement
        ) {
          syncedAnchorElement = null;
          return;
        }
        const fallback =
          state.selectElement ||
          state.compositeElement ||
          state.disclosureElement;
        syncedAnchorElement = fallback;
        combobox.setState("anchorElement", syncedAnchorElement);
      },
    ),
  );

  // Give select-mode stores the first enabled item when no value was provided.
  // Item registration is incremental, so defer and re-read the mode after
  // synchronous element and item updates settle.
  setup(combobox, () =>
    sync(
      combobox,
      ["items", "selectedValue", "selectElement"],
      (state, prevState) => {
        if (!shouldSetDefaultSelectedValue) return;
        if (state.selectedValue !== prevState.selectedValue) {
          shouldSetDefaultSelectedValue = false;
          return;
        }
        if (!state.selectElement) return;
        queueMicrotask(() => {
          if (!shouldSetDefaultSelectedValue) return;
          const state = combobox.getState();
          if (!state.selectElement) return;
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

  // Keep tag values and the combobox selection in sync.
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
      combobox.setState("inputValue", inputValue);
    }),
  );

  // Reset the closed state and arm selected-item resolution before opening. The
  // items may not register until the popover mounts, so the resolver below must
  // remain armed across the open transition.
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

  // When the activeId changes, but the moves count doesn't, we reset the
  // activeValue state. This is useful when the activeId changes because of
  // a mouse move interaction. Both changes also transfer active item ownership
  // away from the selected-item resolver.
  setup(combobox, () =>
    sync(combobox, ["moves", "activeId"], (state, prevState) => {
      if (state.moves !== prevState.moves) {
        resolveSelectedItemOnOpen = false;
      }
      if (state.activeId !== prevState.activeId) {
        resolveSelectedItemOnOpen = false;
      }
      if (state.moves === prevState.moves) {
        combobox.setState("activeValue", undefined);
      }
    }),
  );

  // Update the active value after composite movement.
  setup(combobox, () =>
    batch(combobox, ["moves", "renderedItems"], (state, prev) => {
      if (state.moves === prev.moves) return;
      const { activeId } = combobox.getState();
      const activeItem = composite.item(activeId);
      combobox.setState("activeValue", activeItem?.value);
    }),
  );

  // Point the active item at the current selection while closed or on open.
  // Stop once the user moves so later item registrations don't steal active
  // state.
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

  // Commit moved items immediately while closed, matching a native select.
  // While open, commit only when selectOnMove is enabled.
  setup(combobox, () =>
    batch(combobox, ["selectOnMove", "moves"], (state) => {
      const { activeId, open, selectedValue, selectElement } =
        combobox.getState();
      if (!selectElement) return;
      if (!state.selectOnMove && open) return;
      if (Array.isArray(selectedValue)) return;
      if (!state.moves) return;
      if (!activeId) return;
      const item = composite.item(activeId);
      if (!item || item.disabled || item.value == null) return;
      combobox.setState("selectedValue", item.value);
    }),
  );

  const setInputValue: ComboboxStore["setInputValue"] = (value) => {
    combobox.setState("inputValue", value);
  };

  const resetInputValue = () => setInputValue(initialState.inputValue);

  const setState: ComboboxStore["setState"] = (key, value) => {
    selectDefaultOptions.delete(key);
    if (key === "includesBaseElement") {
      selectDefaultOptions.delete("compositeElementInFocusOrder");
    }
    if (key === "selectedValue") {
      shouldSetDefaultSelectedValue = false;
    }
    combobox.setState(key, value);
  };

  return {
    ...popover,
    ...composite,
    ...combobox,
    setState,
    tag,
    setInputValue,
    resetInputValue,
    setValue: setInputValue,
    resetValue: resetInputValue,
    setSelectedValue: (selectedValue) =>
      setState("selectedValue", selectedValue),
    setInputElement: (element) => combobox.setState("inputElement", element),
    setLabelElement: (element) => combobox.setState("labelElement", element),
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
  /**
   * Defaults to `true`, or `false` when a
   * [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) is
   * rendered.
   */
  compositeElementInFocusOrder: CompositeStoreState<ComboboxStoreItem>["compositeElementInFocusOrder"];
  /**
   * @deprecated Use
   * [`compositeElementInFocusOrder`](https://ariakit.com/reference/combobox-provider#compositeelementinfocusorder)
   * instead.
   */
  includesBaseElement: CompositeStoreState<ComboboxStoreItem>["includesBaseElement"];
  /**
   * Defaults to `true`, or `false` when a
   * [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) is
   * rendered.
   */
  focusLoop: CompositeStoreState<ComboboxStoreItem>["focusLoop"];
  /**
   * Defaults to `true`, or `false` when a
   * [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) is
   * rendered.
   */
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
  inputValue: string;
  /**
   * The combobox input value.
   * @deprecated Use
   * [`inputValue`](https://ariakit.com/reference/combobox-provider#inputvalue)
   * instead.
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
   * - [Form with Select](https://ariakit.com/examples/form-select)
   * - [Select grid](https://ariakit.com/examples/select-grid)
   * - [Select with custom
   *   items](https://ariakit.com/examples/select-item-custom)
   * - [Multi-selectable Combobox
   *   Select](https://ariakit.com/examples/select-multiple)
   * - [Toolbar with Select](https://ariakit.com/examples/toolbar-select)
   * - [Combobox Select with Next.js App
   *   Router](https://ariakit.com/examples/select-next-router)
   */
  selectedValue: MutableValue<T>;
  /**
   * Whether the combobox
   * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
   * should be set when the active item changes by moving while
   * [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) is open.
   * The selected value is always updated when moving while the select is
   * closed.
   *
   * Live examples:
   * - [Select grid](https://ariakit.com/examples/select-grid)
   * - [Select with custom
   *   items](https://ariakit.com/examples/select-item-custom)
   * @default false
   */
  selectOnMove: boolean;
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
   * The combobox select element.
   *
   * Live examples:
   * - [Form with Select](https://ariakit.com/examples/form-select)
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
   * Sets the
   * [`inputValue`](https://ariakit.com/reference/combobox-provider#inputvalue)
   * state.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.com/examples/combobox-textarea)
   * @example
   * store.setInputValue("Hello world");
   * store.setInputValue((value) => value + "!");
   */
  setInputValue: SetState<ComboboxStoreState<T>["inputValue"]>;
  /**
   * Resets the
   * [`inputValue`](https://ariakit.com/reference/combobox-provider#inputvalue)
   * state to its initial value.
   */
  resetInputValue: () => void;
  /**
   * Sets the
   * [`inputValue`](https://ariakit.com/reference/combobox-provider#inputvalue)
   * state.
   * @deprecated Use [`setInputValue`](https://ariakit.com/reference/combobox-provider#setinputvalue)
   * instead.
   */
  setValue: SetState<ComboboxStoreState<T>["value"]>;
  /**
   * Resets the
   * [`inputValue`](https://ariakit.com/reference/combobox-provider#inputvalue)
   * state to its initial value.
   * @deprecated Use
   * [`resetInputValue`](https://ariakit.com/reference/use-combobox-store#resetinputvalue)
   * instead.
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
      | "compositeElementInFocusOrder"
      | "focusLoop"
      | "focusWrap"
      | "orientation"
      | "virtualFocus"
      | "inputValue"
      | "value"
      | "selectedValue"
      | "selectOnMove"
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
  defaultInputValue?: ComboboxStoreState<T>["inputValue"];
  /**
   * The initial value of the combobox input.
   * @deprecated Use
   * [`defaultInputValue`](https://ariakit.com/reference/combobox-provider#defaultinputvalue)
   * instead.
   * @default ""
   */
  defaultValue?: ComboboxStoreState<T>["value"];
  /**
   * The initial value of the
   * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
   * state. This can be a string or an array of strings. If it's an array, the
   * combobox is considered
   * [multi-selectable](https://ariakit.com/examples/combobox-multiple).
   *
   * The default value is `""` for a plain combobox. When a
   * [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) is
   * rendered, the first enabled item with a defined value is selected instead.
   * Pass `""` explicitly to prevent this automatic selection.
   *
   * Live examples:
   * - [Form with Select](https://ariakit.com/examples/form-select)
   * - [Animated Select](https://ariakit.com/examples/select-animated)
   * - [Searchable Combobox
   *   Select](https://ariakit.com/examples/select-combobox)
   * - [Select group](https://ariakit.com/examples/select-group)
   * - [Combobox Select with Next.js App
   *   Router](https://ariakit.com/examples/select-next-router)
   * - [Combobox Select with
   *   Tabs](https://ariakit.com/examples/select-combobox-tab)
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
