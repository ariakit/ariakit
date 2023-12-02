import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.ComboboxLabel className="label">Email</Ariakit.ComboboxLabel>
      <Ariakit.Combobox type="email" className="combobox" />
      <Ariakit.ComboboxPopover gutter={8} sameWidth className="popover">
        <Ariakit.ComboboxItem
          className="combobox-item"
          value="email1@ariakit.org"
        />
        <Ariakit.ComboboxItem
          className="combobox-item"
          value="email2@ariakit.org"
        />
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
