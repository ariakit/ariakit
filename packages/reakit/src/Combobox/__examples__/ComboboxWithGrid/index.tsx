import * as React from "react";
import {
  unstable_useComboboxGridState as useComboboxGridState,
  unstable_Combobox as Combobox,
  unstable_ComboboxGrid as ComboboxGrid,
  unstable_ComboboxGridRow as ComboboxGridRow,
  unstable_ComboboxGridCell as ComboboxGridCell,
} from "reakit/Combobox";
import { initialValues } from "./initialValues";

const style = {
  display: "inline-flex",
  width: 150,
  height: 150,
  alignItems: "center",
  padding: 8,
  border: "1px solid #aaa",
};

export default function ComboboxWithGrid() {
  const combobox = useComboboxGridState({
    columns: 3,
    limit: 15,
    values: initialValues,
    autocomplete: true,
    unstable_angular: true,
  });

  return (
    <>
      <label htmlFor={combobox.baseId}>Type something</label>
      <br />
      <Combobox {...combobox} />
      <ComboboxGrid {...combobox}>
        {combobox.matches.map((row, i) => (
          <ComboboxGridRow {...combobox} key={i}>
            {row.map((value) => (
              <ComboboxGridCell
                {...combobox}
                key={value}
                id={value}
                value={value}
                as="div"
                style={style}
              />
            ))}
          </ComboboxGridRow>
        ))}
      </ComboboxGrid>
    </>
  );
}
