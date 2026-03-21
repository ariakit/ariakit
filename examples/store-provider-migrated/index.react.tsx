import {
  Combobox,
  ComboboxList,
  ComboboxProvider,
  CompositeItem,
} from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
        }}
      >
        Show combobox
      </button>
      {open && (
        <ComboboxProvider>
          <Combobox aria-label="Search" />
          <ComboboxList alwaysVisible aria-label="Fruits">
            <CompositeItem store={ComboboxProvider}>Apple</CompositeItem>
            <CompositeItem store={ComboboxProvider}>Banana</CompositeItem>
          </ComboboxList>
        </ComboboxProvider>
      )}
    </div>
  );
}
