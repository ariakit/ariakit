import * as React from "react";
import { SetState } from "reakit-utils/types";
import { CompositeStateReturn } from "../../Composite/CompositeState";

export type ComboboxBaseState = {
  /**
   * Current value that will be used to filter `values`.
   */
  inputValue: string;
  /**
   * Value of the item that is currently selected.
   */
  currentValue?: string;
  /**
   * TODO.
   */
  autocomplete: boolean;
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
   * Indicates the type of the suggestions popup.
   */
  menuRole: "listbox" | "tree" | "grid" | "dialog";
  /**
   * Whether the suggestions popup is visible or not.
   */
  visible: boolean;
};

export type ComboboxBaseActions = {
  /**
   * Sets `currentValue`.
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
  "inputValue" | "currentValue" | "autocomplete" | "values" | "limit"
>;

export type ComboboxBaseStateReturn = ComboboxBaseState & ComboboxBaseActions;

function filter(
  currentValue: ComboboxBaseState["inputValue"],
  values: ComboboxBaseState["values"],
  limit: ComboboxBaseState["limit"]
) {
  return values
    .filter((value) => value.search(new RegExp(currentValue, "i")) !== -1)
    .slice(0, limit);
}

export function useComboboxBaseState<T extends CompositeStateReturn>(
  composite: T,
  {
    inputValue: initialInputValue = "",
    currentValue: initialCurrentValue,
    autocomplete: initialAutocomplete = false,
    values: initialValues = [],
    limit: initialLimit,
  }: ComboboxBaseInitialState = {}
) {
  const [inputValue, setInputValue] = React.useState(initialInputValue);
  const [currentValue, setCurrentValue] = React.useState(initialCurrentValue);
  const [autocomplete, setAutocomplete] = React.useState(initialAutocomplete);
  const [values, setValues] = React.useState(initialValues);
  const [limit, setLimit] = React.useState(initialLimit);
  const [matches, setMatches] = React.useState(() =>
    filter(inputValue, values, limit)
  );

  React.useEffect(() => {
    setMatches(filter(inputValue, values, limit));
    composite.setCurrentId(null);
  }, [inputValue, values, limit, composite.setCurrentId]);

  React.useEffect(() => {
    if (composite.currentId === null) {
      setCurrentValue(undefined);
    }
  }, [composite.currentId]);

  return {
    ...composite,
    visible: true,
    inputValue,
    currentValue,
    autocomplete,
    values,
    limit,
    matches,
    setInputValue,
    setCurrentValue,
    setAutocomplete,
    setValues,
    setLimit,
  };
}
