import * as React from "react";
import {
  unstable_useComboboxState as useComboboxState,
  unstable_Combobox as Combobox,
  unstable_ComboboxPopover as ComboboxPopover,
  unstable_ComboboxOption as ComboboxOption,
} from "reakit/Combobox";

import "./style.css";

export default function AccessibleComboboxContext() {
  const combobox = useComboboxState({ gutter: 8 });
  return (
    <>
      <Combobox {...combobox} aria-label="Fruit" />
      <ComboboxPopover {...combobox} aria-label="Fruits">
        <ComboboxOption value="Apple" />
        <ComboboxOption value="Orange" />
        <ComboboxOption value="Banana" />
      </ComboboxPopover>
    </>
  );
}
