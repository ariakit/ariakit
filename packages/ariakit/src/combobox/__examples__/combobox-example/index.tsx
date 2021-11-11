import {
  Combobox,
  ComboboxItem,
  ComboboxLabel,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";

export default function ComboboxExample() {
  const combobox = useComboboxState();
  return (
    <div>
      <ComboboxLabel state={combobox}>Fruit</ComboboxLabel>
      <Combobox state={combobox} />
      <ComboboxPopover state={combobox} aria-label="Fruits">
        <ComboboxItem value="Apple" />
        <ComboboxItem value="Orange" />
        <ComboboxItem value="Watermelon" />
      </ComboboxPopover>
    </div>
  );
}
