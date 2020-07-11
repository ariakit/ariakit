import * as React from "react";
import { SetState } from "reakit-utils/types";
import {
  SealedInitialState,
  useSealedState,
} from "reakit-utils/useSealedState";
import {
  useCompositeState,
  CompositeState,
  CompositeActions,
  CompositeInitialState,
} from "../Composite/CompositeState";

export type unstable_ComboboxState = CompositeState & {
  /**
   * Current value that will be used to filter `values`.
   */
  currentValue: string;
  /**
   * Value of the item that is currently selected.
   */
  selectedValue?: string;
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
};

export type unstable_ComboboxActions = CompositeActions & {
  /**
   * Sets `currentValue`.
   */
  setCurrentValue: SetState<unstable_ComboboxState["currentValue"]>;
  /**
   * Sets `selectedValue`.
   */
  setSelectedValue: SetState<unstable_ComboboxState["selectedValue"]>;
  /**
   * Sets `autocomplete`.
   */
  setAutocomplete: SetState<unstable_ComboboxState["autocomplete"]>;
  /**
   * Sets `values`.
   */
  setValues: SetState<unstable_ComboboxState["values"]>;
  /**
   * Sets `limit`.
   */
  setLimit: SetState<unstable_ComboboxState["limit"]>;
};

function filter(
  currentValue: unstable_ComboboxState["currentValue"],
  values: unstable_ComboboxState["values"],
  limit: unstable_ComboboxState["limit"]
) {
  return values
    .filter((value) => value.search(new RegExp(currentValue, "i")) !== -1)
    .slice(0, limit);
}

export type unstable_ComboboxInitialState = Omit<
  CompositeInitialState,
  "unstable_virtual"
> &
  Pick<
    Partial<unstable_ComboboxState>,
    "currentValue" | "selectedValue" | "autocomplete" | "values" | "limit"
  >;

export type unstable_ComboboxStateReturn = unstable_ComboboxState &
  unstable_ComboboxActions;

export function unstable_useComboboxState(
  initialState: SealedInitialState<unstable_ComboboxInitialState> = {}
): unstable_ComboboxStateReturn {
  const {
    currentValue: initialValue = "",
    selectedValue: initialSelectedValue,
    autocomplete: initialAutocomplete = false,
    values: initialValues = [],
    limit: initialLimit,
    currentId = null,
    ...sealed
  } = useSealedState(initialState);

  const composite = useCompositeState({
    currentId,
    ...sealed,
    unstable_virtual: true,
  });

  const [currentValue, setCurrentValue] = React.useState(initialValue);
  const [selectedValue, setSelectedValue] = React.useState(
    initialSelectedValue
  );
  const [autocomplete, setAutocomplete] = React.useState(initialAutocomplete);
  const [values, setValues] = React.useState(initialValues);
  const [limit, setLimit] = React.useState(initialLimit);
  const [matches, setMatches] = React.useState(() =>
    filter(currentValue, values, limit)
  );

  React.useEffect(() => {
    setMatches(filter(currentValue, values, limit));
    composite.setCurrentId(null);
  }, [currentValue, values, limit, composite.setCurrentId]);

  React.useEffect(() => {
    if (composite.currentId === null) {
      setSelectedValue(undefined);
    }
  }, [composite.currentId]);

  return {
    ...composite,
    currentValue,
    selectedValue,
    autocomplete,
    values,
    limit,
    matches,
    setCurrentValue,
    setSelectedValue,
    setAutocomplete,
    setValues,
    setLimit,
  };
}
