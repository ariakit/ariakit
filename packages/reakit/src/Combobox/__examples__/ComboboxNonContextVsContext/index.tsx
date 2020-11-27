import {
  unstable_Combobox as Combobox,
  unstable_ComboboxOption as ComboboxOption,
  unstable_useComboboxState as useComboboxState,
  unstable_ComboboxPopover as ComboboxPopover,
} from "reakit/Combobox";
import "./style.css";
import * as React from "react";

function ComboboxOriginal() {
  const items = Array.from({ length: 250 }).map((_, i) => `Item ${i}`);

  const combobox = useComboboxState({
    values: items,
    gutter: 8,
    limit: false,
    autoSelect: true,
  });

  return (
    <>
      <Combobox {...combobox} aria-label="Color" placeholder="Type a color" />
      <ComboboxPopover {...combobox} aria-label="Colors">
        {combobox.matches.map((value) => (
          <ComboboxOption {...combobox} key={value} value={value} />
        ))}
      </ComboboxPopover>
    </>
  );
}

function ComboboxContext() {
  const items = Array.from({ length: 250 }).map((_, i) => `Item ${i}`);

  const combobox = useComboboxState({
    values: items,
    gutter: 8,
    limit: false,
    autoSelect: true,
  });

  return (
    <>
      <Combobox {...combobox} aria-label="Color" placeholder="Type a color" />
      <ComboboxPopover {...combobox} aria-label="Colors">
        {combobox.matches.map((value) => (
          <ComboboxOption key={value} value={value} />
        ))}
      </ComboboxPopover>
    </>
  );
}

export default function ComboBoxNonContextVsContext() {
  return (
    <>
      <div>
        <p>
          <strong>Original Combobox</strong>, clicking on it may take some time.
          Use arrows (hold down your down-arrow key) to navigate between
          elements. You will notice how slow it is.
        </p>

        <ComboboxOriginal />
      </div>

      <div>
        <p>
          <strong>New Combobox using Context</strong>, clicking on it takes less
          time. Use arrows (hold down your down-arrow key) to navigate between
          elements. You will notice how fast it is compared to the original.
        </p>

        <ComboboxContext />
      </div>
    </>
  );
}
