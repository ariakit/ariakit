import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.ComboboxLabel className="label">
        Your favorite fruit
      </Ariakit.ComboboxLabel>
      <Ariakit.Combobox placeholder="e.g., Apple" className="combobox" />
      <Ariakit.ComboboxPopover
        gutter={4}
        sameWidth
        className="popover -translate-y-[5%] opacity-0 transition-[opacity,transform] duration-200 ease-in-out data-enter:translate-y-0 data-enter:opacity-100"
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
    </Ariakit.ComboboxProvider>
  );
}
