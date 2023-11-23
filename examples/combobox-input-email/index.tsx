import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div className="wrapper">
      <Ariakit.ComboboxProvider>
        <label className="label">
          E-mail
          <Ariakit.Combobox type="email" className="combobox" />
        </label>
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
    </div>
  );
}
