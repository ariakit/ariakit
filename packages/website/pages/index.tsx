import React from "react";
import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit";

export default function Home() {
  const combobox = useComboboxState();
  return (
    <div>
      <Combobox state={combobox} />
      <ComboboxPopover state={combobox}>
        <ComboboxItem value="Item 1" />
        <ComboboxItem value="Item 2" />
        <ComboboxItem value="Item 3" />
      </ComboboxPopover>
    </div>
  );
}
