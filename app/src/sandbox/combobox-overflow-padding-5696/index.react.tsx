import * as Ariakit from "@ariakit/react";
import "./style.css";

const overflowPadding = {
  top: 48,
  right: 32,
  left: 8,
} satisfies Ariakit.ComboboxPopoverOptions["overflowPadding"];

export default function Example() {
  return (
    <Ariakit.ComboboxProvider defaultOpen>
      <Ariakit.ComboboxLabel>Favorite fruit</Ariakit.ComboboxLabel>
      <Ariakit.Combobox />
      <Ariakit.ComboboxPopover
        className="popover"
        overflowPadding={overflowPadding}
      >
        <Ariakit.ComboboxItem value="Apple" />
        <Ariakit.ComboboxItem value="Orange" />
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
