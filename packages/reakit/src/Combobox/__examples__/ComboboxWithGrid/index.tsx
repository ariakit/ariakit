import * as React from "react";
import {
  unstable_useComboboxState as useComboboxState,
  unstable_useComboboxMenuGridState as useComboboxMenuGridState,
  unstable_Combobox as Combobox,
  unstable_ComboboxPopover as ComboboxPopover,
  unstable_ComboboxMenu as ComboboxMenu,
  unstable_ComboboxGridRow as ComboboxGridRow,
  unstable_ComboboxGridCell as ComboboxGridCell,
  unstable_ComboboxOption as ComboboxOption,
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
  const combobox = useComboboxMenuGridState({
    columns: 3,
    limit: 15,
    values: initialValues,
    // autocomplete: true,
    unstable_angular: true,
  });

  const combobox2 = useComboboxState({
    values: initialValues,
    autocomplete: "both",
    autoSelect: true,
    limit: 15,
  });

  return (
    <>
      <label htmlFor={combobox2.baseId}>Type something</label>
      <br />
      <Combobox {...combobox2} />
      <ComboboxPopover {...combobox2}>
        {combobox2.matches.map((value) => (
          <ComboboxOption
            {...combobox2}
            key={value}
            id={`${combobox2.baseId}-${value}`}
            value={value}
          />
        ))}
      </ComboboxPopover>
      <button>Button</button>
      <label htmlFor={combobox.baseId}>Type something</label>
      <br />
      <Combobox {...combobox} />
      <ComboboxMenu {...combobox}>
        {combobox.matches.map((row, i) => (
          <ComboboxGridRow {...combobox} key={i}>
            {row.map((value) => (
              <ComboboxGridCell
                {...combobox}
                key={value}
                id={`${combobox.baseId}-${value}`}
                value={value}
                as="div"
                style={style}
              />
            ))}
          </ComboboxGridRow>
        ))}
      </ComboboxMenu>
    </>
  );
}
