import * as React from "react";
import { SetState } from "reakit-utils/types";
import { removeItemFromArray } from "reakit-utils/removeItemFromArray";
import { CompositeStateReturn } from "../../Composite/CompositeState";

export type ComboboxBaseState = {
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
   * Determines how the combobox autocomplete will behave and how the `matches`
   * state will be populated:
   *  - `none`: Values aren't automatically filtered.
   *  - `inline`: Values aren't automatically filtered. The combobox input
   * value will change inline to reflect the currently selected item value.
   *  - `list`: Values are automatically filtered based on `inputValue`.
   *  - `both`: Values are automatically filtered based on `inputValue`.
   * The combobox input value will change inline to reflect the currently
   * selected item value.
   */
  // TODO: Maybe inline doesn't make sense
  // We can only inline autocomplete if the list is also autocompleting?
  autocomplete: "none" | "inline" | "list" | "both";
  /**
   * Determines whether the first match will be automatically selected. When
   * it's set to `true`, the exact behavior will depend on the value of
   * `autocomplete`:
   *  - `none`: The first value is automatically selected, but the input value
   * remains the same.
   *  - `inline`: The first value is automatically selected and the combobox
   * input value will change inline to reflect this. The inline completion
   * string will be highlighted and will have a selected state.
   *  - `list`: The first match is automatically selected, but the input value
   * remains the same.
   *  - `both`: The first match is automatically selected and the combobox
   * input value will change inline to reflect this. The inline completion
   * string will be highlighted and will have a selected state.
   */
  autoSelect: boolean;
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
   * Whether the suggestions popup is visible or not.
   */
  visible: boolean;
};

export type ComboboxBaseActions = {
  /**
   * Sets `inputValue`.
   */
  setInputValue: SetState<ComboboxBaseState["inputValue"]>;
  /**
   * Sets `currentValue`.
   */
  setCurrentValue: SetState<ComboboxBaseState["currentValue"]>;
  /**
   * Sets `autocomplete`.
   */
  setAutocomplete: SetState<ComboboxBaseState["autocomplete"]>;
  /**
   * Sets `autoSelect`.
   */
  setAutoSelect: SetState<ComboboxBaseState["autoSelect"]>;
  /**
   * Sets `values`.
   */
  setValues: SetState<ComboboxBaseState["values"]>;
  /**
   * Sets `limit`.
   */
  setLimit: SetState<ComboboxBaseState["limit"]>;
};

export type ComboboxBaseInitialState = Pick<
  Partial<ComboboxBaseState>,
  | "inputValue"
  | "currentValue"
  | "autocomplete"
  | "autoSelect"
  | "values"
  | "limit"
>;

export type ComboboxBaseStateReturn = ComboboxBaseState & ComboboxBaseActions;

function getMatches(
  inputValue: ComboboxBaseState["inputValue"],
  values: ComboboxBaseState["values"],
  limit: ComboboxBaseState["limit"],
  autocomplete: ComboboxBaseState["autocomplete"],
  autoSelect: ComboboxBaseState["autoSelect"]
) {
  if (autocomplete === "none" || autocomplete === "inline") {
    return values.slice(0, limit);
  }
  const searchValue = new RegExp(inputValue, "i");
  let matches = values
    .filter((value) => value.search(searchValue) !== -1)
    .slice(0, autoSelect && limit ? limit - 1 : limit);

  if (autoSelect) {
    const firstMatch = values.find(
      (value) => value.search(new RegExp(`^${inputValue}`, "i")) !== -1
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
    currentValue: initialCurrentValue,
    autocomplete: initialAutocomplete = "list",
    autoSelect: initialAutoSelect = false,
    values: initialValues = [],
    limit: initialLimit = 10,
  }: ComboboxBaseInitialState = {}
) {
  const [inputValue, setInputValue] = React.useState(initialInputValue);
  const [currentValue, setCurrentValue] = React.useState(initialCurrentValue);
  const [autocomplete, setAutocomplete] = React.useState(initialAutocomplete);
  const [autoSelect, setAutoSelect] = React.useState(initialAutoSelect);
  const [values, setValues] = React.useState(initialValues);
  const [limit, setLimit] = React.useState(initialLimit);

  const matches = React.useMemo(
    () => getMatches(inputValue, values, limit, autocomplete, autoSelect),
    [inputValue, values, limit, autocomplete, autoSelect]
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

  React.useEffect(() => {
    if (composite.currentId === null) {
      setCurrentValue(undefined);
    }
  }, [composite.currentId]);
  // TODO Replace registerItem to get value

  return {
    ...composite,
    visible: true,
    inputValue,
    currentValue,
    autocomplete,
    autoSelect,
    values,
    limit,
    matches,
    setInputValue,
    setCurrentValue,
    setAutocomplete,
    setAutoSelect,
    setValues,
    setLimit,
  };
}
