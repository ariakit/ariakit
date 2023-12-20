import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.ComboboxProvider focusWrap={false} focusLoop={false}>
      <Ariakit.ComboboxLabel className="label">Direction</Ariakit.ComboboxLabel>
      <Ariakit.Combobox className="combobox" placeholder="e.g., Top, Center" />
      <Ariakit.ComboboxPopover role="grid" gutter={4} className="popover">
        <Ariakit.ComboboxRow className="combobox-row">
          <Ariakit.ComboboxItem className="combobox-item" value="Top Left" />
          <Ariakit.ComboboxItem className="combobox-item" value="Top Center" />
          <Ariakit.ComboboxItem className="combobox-item" value="Top Right" />
        </Ariakit.ComboboxRow>
        <Ariakit.ComboboxRow className="combobox-row">
          <Ariakit.ComboboxItem className="combobox-item" value="Center Left" />
          <Ariakit.ComboboxItem className="combobox-item" value="Center" />
          <Ariakit.ComboboxItem
            className="combobox-item"
            value="Center Right"
          />
        </Ariakit.ComboboxRow>
        <Ariakit.ComboboxRow className="combobox-row">
          <Ariakit.ComboboxItem className="combobox-item" value="Bottom Left" />
          <Ariakit.ComboboxItem
            className="combobox-item"
            value="Bottom Center"
          />
          <Ariakit.ComboboxItem
            className="combobox-item"
            value="Bottom Right"
          />
        </Ariakit.ComboboxRow>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
