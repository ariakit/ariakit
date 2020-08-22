import * as React from "react";
import { SetState } from "reakit-utils/types";
import { removeItemFromArray } from "reakit-utils/removeItemFromArray";
import {
  CompositeStateReturn,
  CompositeState,
  CompositeActions,
} from "../../Composite/CompositeState";
import { Item } from "./types";

export type ComboboxBaseState<T extends CompositeState = CompositeState> = Omit<
  T,
  "items"
> & {
  /**
   * Lists all the combobox items with their `id`, DOM `ref`, `disabled` state,
   * `value` and `groupId` if any. This state is automatically updated when
   * `registerItem` and `unregisterItem` are called.
   */
  items: Item[];
  /**
   * Indicates the type of the suggestions popup.
   */
  menuRole: "listbox" | "tree" | "grid" | "dialog";
  /**
   * Combobox input value that will be used to filter `values` and populate
   * the `matches` property.
   */
  inputValue: string;
  /**
   * Value of the item that is currently selected.
   */
  currentValue?: string;
  /**
   * Values that will be used to produce `matches`.
   */
  values: string[];
  /**
   * Maximum number of matches.
   */
  limit?: number;
  /**
   * Result of filtering `values` by `currentValue`.
   */
  matches: string[];
  /**
   * Determines how the combobox options behave: dynamically or statically.
   * By default, it's `true` if `values` are provided. Otherwise, it's `false`:
   *   - If it's `true` and `values` are provided, then they will be
   * automatically filtered based on `inputValue` and will populate `matches`.
   *   - If it's `true` and `values` aren't provided, this means that you'll
   * provide and filter values by yourself. `matches` will be empty.
   *   - If it's `false` and `values` are provided, then they won't be
   * automatically filtered and `matches` will be the same as `values`.
   */
  list: boolean;
  /**
   * Determines whether focusing on an option will temporarily change the value
   * of the combobox. If it's `true`, focusing on an option will temporarily
   * change the combobox value to the option's value.
   */
  inline: boolean;
  /**
   * Determines whether the first option will be automatically selected. When
   * it's set to `true`, the exact behavior will depend on the value of
   * `inline`:
   *   - If `inline` is `true`, the first option is automatically focused when
   * the combobox popover opens and the input value changes to reflect this.
   * The inline completion string will be highlighted and will have a selected
   * state.
   *   - If `inline` is `false`, the first option is automatically focused when
   * the combobox popover opens, but the input value remains the same.
   */
  autoSelect: boolean;
  /**
   * Whether the suggestions popup is visible or not.
   */
  visible: boolean;
};

export type ComboboxBaseActions<
  T extends CompositeActions = CompositeActions
> = Omit<T, "registerItem"> & {
  /**
   * Registers a combobox item.
   */
  registerItem: (item: Item) => void;
  /**
   * Sets `inputValue`.
   */
  setInputValue: SetState<ComboboxBaseState["inputValue"]>;
  /**
   * Sets `values`.
   */
  setValues: SetState<ComboboxBaseState["values"]>;
  /**
   * Sets `limit`.
   */
  setLimit: SetState<ComboboxBaseState["limit"]>;
  /**
   * Sets `list`.
   */
  setList: SetState<ComboboxBaseState["list"]>;
  /**
   * Sets `inline`.
   */
  setInline: SetState<ComboboxBaseState["inline"]>;
  /**
   * Sets `autoSelect`.
   */
  setAutoSelect: SetState<ComboboxBaseState["autoSelect"]>;
};

export type ComboboxBaseInitialState = Pick<
  Partial<ComboboxBaseState>,
  "inputValue" | "values" | "limit" | "list" | "inline" | "autoSelect"
>;

export type ComboboxBaseStateReturn<
  T extends CompositeStateReturn
> = ComboboxBaseState<T> & ComboboxBaseActions<T>;

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getMatches(
  inputValue: ComboboxBaseState["inputValue"],
  values: ComboboxBaseState["values"],
  limit: ComboboxBaseState["limit"],
  list: ComboboxBaseState["list"],
  autoSelect: ComboboxBaseState["autoSelect"]
) {
  if (!list) {
    return values.slice(0, limit);
  }
  const searchValue = new RegExp(escapeRegExp(inputValue), "i");
  let matches = values
    .filter((value) => value.search(searchValue) !== -1)
    .slice(0, autoSelect && limit ? limit - 1 : limit);

  if (autoSelect) {
    const firstMatch = values.find(
      (value) =>
        value.search(new RegExp(`^${escapeRegExp(inputValue)}`, "i")) !== -1
    );
    if (firstMatch) {
      matches = removeItemFromArray(matches, firstMatch);
      matches.unshift(firstMatch);
    }
  }

  return matches;
}

export function useComboboxBaseState<T extends CompositeStateReturn>(
  composite: T,
  {
    inputValue: initialInputValue = "",
    values: initialValues = [],
    limit: initialLimit = 10,
    list: initialList = !!initialValues.length,
    inline: initialInline = false,
    autoSelect: initialAutoSelect = false,
  }: ComboboxBaseInitialState = {}
): ComboboxBaseStateReturn<T> {
  const valuesById = React.useRef<Record<string, string | undefined>>({});

  const [inputValue, setInputValue] = React.useState(initialInputValue);
  const [values, setValues] = React.useState(initialValues);
  const [limit, setLimit] = React.useState(initialLimit);
  const [list, setList] = React.useState(initialList);
  const [inline, setInline] = React.useState(initialInline);
  const [autoSelect, setAutoSelect] = React.useState(initialAutoSelect);

  const matches = React.useMemo(
    () => getMatches(inputValue, values, limit, list, autoSelect),
    [inputValue, values, limit, list, autoSelect]
  );

  const currentValue = React.useMemo(
    () =>
      composite.currentId ? valuesById.current[composite.currentId] : undefined,
    [valuesById, composite.currentId]
  );
  // TODO: Create examples and test
  // Test click outside with autoSelect should change inputValue
  React.useEffect(() => {
    if (autoSelect) {
      composite.first();
    } else {
      composite.setCurrentId(null);
    }
  }, [matches, autoSelect, composite.first, composite.setCurrentId]);

  const items = React.useMemo(() => {
    composite.items.forEach((item) => {
      if (item.id) {
        (item as Item).value = valuesById.current[item.id];
      }
    });
    return composite.items;
  }, [composite.items]);

  const registerItem = React.useCallback(
    (item: Item) => {
      composite.registerItem(item);
      if (item.id) {
        valuesById.current[item.id] = item.value;
      }
    },
    [composite.registerItem]
  );

  const unregisterItem = React.useCallback(
    (id: string) => {
      composite.unregisterItem(id);
      delete valuesById.current[id];
    },
    [composite.unregisterItem]
  );

  return {
    ...composite,
    menuRole: "listbox",
    items,
    registerItem,
    unregisterItem,
    visible: true,
    inputValue,
    currentValue,
    values,
    limit,
    matches,
    list,
    inline,
    autoSelect,
    setInputValue,
    setValues,
    setLimit,
    setList,
    setInline,
    setAutoSelect,
  };
}
