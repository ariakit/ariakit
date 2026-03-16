import * as Ariakit from "@ariakit/react";
import { useState } from "react";

import "./style.css";

export default function Example() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if (open && value.length < 1) {
    setOpen(false);
  }

  return (
    <Ariakit.ComboboxProvider
      open={open}
      setOpen={setOpen}
      value={value}
      setValue={setValue}
    >
      <Ariakit.ComboboxLabel className="label">
        Your favorite fruit
      </Ariakit.ComboboxLabel>
      <Ariakit.Combobox placeholder="e.g., Apple" className="combobox" />
      <Ariakit.ComboboxPopover gutter={8} sameWidth className="popover">
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
    </Ariakit.ComboboxProvider>
  );
}
