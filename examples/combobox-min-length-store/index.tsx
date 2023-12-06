import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  const [open, setOpen] = useState(false);
  const combobox = Ariakit.useComboboxStore({ open, setOpen });

  const value = combobox.useState("value");

  if (open && value.length < 1) {
    setOpen(false);
  }

  return (
    <>
      <Ariakit.ComboboxLabel store={combobox} className="label">
        Your favorite fruit
      </Ariakit.ComboboxLabel>
      <Ariakit.Combobox
        store={combobox}
        placeholder="e.g., Apple"
        className="combobox"
      />
      <Ariakit.ComboboxPopover
        store={combobox}
        gutter={8}
        sameWidth
        className="popover"
      >
        <Ariakit.ComboboxItem className="combobox-item" value="Apple">
          🍎 Apple
        </Ariakit.ComboboxItem>
        <Ariakit.ComboboxItem className="combobox-item" value="Grape">
          🍇 Grape
        </Ariakit.ComboboxItem>
        <Ariakit.ComboboxItem className="combobox-item" value="Orange">
          🍊 Orange
        </Ariakit.ComboboxItem>
        <Ariakit.ComboboxItem className="combobox-item" value="Strawberry">
          🍓 Strawberry
        </Ariakit.ComboboxItem>
        <Ariakit.ComboboxItem className="combobox-item" value="Watermelon">
          🍉 Watermelon
        </Ariakit.ComboboxItem>
      </Ariakit.ComboboxPopover>
    </>
  );
}
