import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <Ariakit.ComboboxProvider defaultOpen>
      <Ariakit.ComboboxLabel>Favorite fruit</Ariakit.ComboboxLabel>
      <Ariakit.Combobox />
      <Ariakit.ComboboxPopover
        className="popover"
        overflowPadding={{ top: 24, right: 32, left: 32 }}
      >
        <Ariakit.ComboboxItem value="Apple" />
        <Ariakit.ComboboxItem value="Orange" />
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
