import * as ak from "@ariakit/react";
import { ComboboxSelect } from "@ariakit/ui/components/combobox.ariakit.react";

export default function Example() {
  const store = ak.useComboboxStore({ defaultSelectedValue: "Apple" });
  const selectedValue = ak.useStoreState(store, "selectedValue");
  return (
    <div className="flex flex-col gap-6">
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
      <div>
        <ComboboxSelect
          store={store}
          label="Fruit"
          items={[{ value: "Apple" }, { value: "Orange" }]}
        />
        <p>Selected fruit: {selectedValue}</p>
      </div>
    </div>
  );
}
