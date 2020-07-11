import * as React from "react";
import {
  SealedInitialState,
  useSealedState,
} from "reakit-utils/useSealedState";
import { SetState } from "reakit-utils/types";
import {
  unstable_useComboboxState as useComboboxState,
  unstable_ComboboxState as ComboboxState,
  unstable_ComboboxActions as ComboboxActions,
  unstable_ComboboxInitialState as ComboboxInitialState,
} from "./ComboboxState";

export type unstable_ComboboxGridState = Omit<ComboboxState, "matches"> & {
  /**
   * Number of columns by which `values` will be splitted to generate the
   * `matches` 2D array.
   */
  columns: number;
  /**
   * Result of filtering `values` by `currentValue`.
   */
  matches: string[][];
};

export type unstable_ComboboxGridActions = ComboboxActions & {
  /**
   * Sets `columns`.
   */
  setColumns: SetState<unstable_ComboboxGridState["columns"]>;
};

export type unstable_ComboboxGridInitialState = ComboboxInitialState &
  Pick<Partial<unstable_ComboboxGridState>, "columns">;

export type unstable_ComboboxGridStateReturn = unstable_ComboboxGridState &
  unstable_ComboboxGridActions;

function chunk<T>(array: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0, j = array.length; i < j; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function unstable_useComboboxGridState(
  initialState: SealedInitialState<unstable_ComboboxGridInitialState> = {}
): unstable_ComboboxGridStateReturn {
  const { columns: initialColumns = 1, ...sealed } = useSealedState(
    initialState
  );

  const combobox = useComboboxState(sealed);
  const [columns, setColumns] = React.useState(initialColumns);

  const matches = React.useMemo(() => chunk(combobox.matches, columns), [
    combobox.matches,
    columns,
  ]);

  return {
    ...combobox,
    columns,
    matches,
    setColumns,
  };
}
