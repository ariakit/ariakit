import * as ak from "@ariakit/react";

export default function Example() {
  return (
    <ak.ComboboxProvider defaultOpen>
      <ak.ComboboxLabel>Your favorite fruit</ak.ComboboxLabel>
      <div>
        <ak.Combobox autoFocus placeholder="e.g., Apple" />
        <ak.ComboboxDisclosure />
      </div>
      <ak.ComboboxPopover gutter={4} sameWidth>
        <ak.ComboboxItem value="Apple">Apple</ak.ComboboxItem>
        <ak.ComboboxItem value="Grape">Grape</ak.ComboboxItem>
        <ak.ComboboxItem value="Orange">Orange</ak.ComboboxItem>
        <ak.ComboboxItem value="Strawberry">Strawberry</ak.ComboboxItem>
        <ak.ComboboxItem value="Watermelon">Watermelon</ak.ComboboxItem>
      </ak.ComboboxPopover>
    </ak.ComboboxProvider>
  );
}
