import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";
import { ComboboxProvider } from "@ariakit/react-core/combobox/combobox-provider";

export default function Example() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if (open && value.length < 1) {
    setOpen(false);
  }

  return (
    <div className="wrapper">
      <ComboboxProvider
        open={open}
        setOpen={setOpen}
        value={value}
        setValue={setValue}
      >
        <label className="label">
          Your favorite fruit
          <Ariakit.Combobox placeholder="e.g., Apple" className="combobox" />
        </label>
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
      </ComboboxProvider>
    </div>
  );
}
