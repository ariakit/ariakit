import { ComboboxSelect } from "@ariakit/ui/components/combobox.ariakit.react";

export default function Example() {
  return (
    <div className="flex gap-4">
      <ComboboxSelect
        badge
        aria-label="Default status"
        displayValue="Pending"
      />
      <ComboboxSelect
        badge
        $size={undefined}
        aria-label="Optional status"
        displayValue="Active"
      />
      <ComboboxSelect
        badge
        $size="lg"
        aria-label="Large status"
        displayValue="Complete"
      />
    </div>
  );
}
