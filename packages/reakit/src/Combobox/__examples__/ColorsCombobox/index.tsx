import * as React from "react";
import {
  unstable_useComboboxState as useComboboxState,
  unstable_Combobox as Combobox,
  unstable_ComboboxPopover as ComboboxPopover,
  unstable_ComboboxOption as ComboboxOption,
} from "reakit/Combobox";
import { colors } from "./colors";

export default function ColorsCombobox() {
  const combobox = useComboboxState({ values: colors });
  return (
    <>
      <Combobox {...combobox} aria-label="Colors" />
      <ComboboxPopover {...combobox} aria-label="Colors suggestions">
        {combobox.matches.map((value) => (
          <ComboboxOption {...combobox} key={value} value={value} />
        ))}
      </ComboboxPopover>
    </>
  );
}
