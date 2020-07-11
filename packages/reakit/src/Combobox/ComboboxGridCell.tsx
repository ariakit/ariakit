import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useLiveRef } from "reakit-utils/useLiveRef";
import {
  unstable_GridCellOptions as GridCellOptions,
  unstable_GridCellHTMLProps as GridCellHTMLProps,
  unstable_useGridCell as useGridCell,
} from "../Grid/GridCell";
import { COMBOBOX_GRID_CELL_KEYS } from "./__keys";
import { unstable_ComboboxStateReturn } from "./ComboboxState";

export type unstable_ComboboxGridCellOptions = GridCellOptions &
  Pick<unstable_ComboboxStateReturn, "setCurrentValue" | "setSelectedValue"> & {
    /**
     * Cell's value.
     */
    value: string;
  };

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

  useProps(
    options,
    { onClick: htmlOnClick, onFocus: htmlOnFocus, ...htmlProps }
  ) {
    const onClickRef = useLiveRef(htmlOnClick);
    const onFocusRef = useLiveRef(htmlOnFocus);

    const onClick = React.useCallback(
      (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        onClickRef.current?.(event);
        if (event.defaultPrevented) return;
        options.setCurrentValue?.(options.value);
      },
      [options.setCurrentValue, options.value]
    );

    const onFocus = React.useCallback(
      (event: React.FocusEvent<HTMLElement>) => {
        onFocusRef.current?.(event);
        if (event.defaultPrevented) return;
        options.setSelectedValue?.(options.value);
      },
      [options.setSelectedValue, options.value]
    );

    return {
      onClick,
      onFocus,
      ...htmlProps,
    };
  },
});

export const unstable_ComboboxGridCell = createComponent({
  as: "span",
  memo: true,
  useHook: unstable_useComboboxGridCell,
});
