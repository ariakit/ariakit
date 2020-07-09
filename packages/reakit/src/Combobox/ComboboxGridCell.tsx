import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import {
  unstable_GridCellOptions as GridCellOptions,
  unstable_GridCellHTMLProps as GridCellHTMLProps,
  unstable_useGridCell as useGridCell,
} from "../Grid/GridCell";
import { COMBOBOX_GRID_CELL_KEYS } from "./__keys";

export type unstable_ComboboxGridCellOptions = GridCellOptions;

export type unstable_ComboboxGridCellHTMLProps = GridCellHTMLProps;

export type unstable_ComboboxGridCellProps = unstable_ComboboxGridCellOptions &
  unstable_ComboboxGridCellHTMLProps;

export const unstable_useComboboxGridCell = createHook<
  unstable_ComboboxGridCellOptions,
  unstable_ComboboxGridCellHTMLProps
>({
  name: "ComboboxGridCell",
  compose: useGridCell,
  keys: COMBOBOX_GRID_CELL_KEYS,
});

export const unstable_ComboboxGridCell = createComponent({
  as: "span",
  memo: true,
  useHook: unstable_useComboboxGridCell,
});
