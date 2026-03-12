import * as ak from "@ariakit/react";

export default function Example() {
  const combobox = ak.useComboboxStore({ defaultOpen: true });

  return (
    <ak.ComboboxProvider store={combobox}>
      <ak.ComboboxLabel>Your favorite fruit</ak.ComboboxLabel>
      <div>
        <ak.Combobox
          autoFocus
          focusable
          placeholder="e.g., Apple"
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            // TODO: Remove when https://github.com/ariakit/ariakit/issues/5518
            // is fixed.
            combobox.hide();
          }}
        />
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
