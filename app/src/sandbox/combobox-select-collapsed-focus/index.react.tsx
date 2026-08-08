import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const fruits = ["Apple", "Banana", "Grape", "Orange"];

interface FruitSelectProps {
  label: string;
  virtualFocus?: boolean;
}

function FruitSelect({ label, virtualFocus }: FruitSelectProps) {
  const [focusedItems, setFocusedItems] = useState<string[]>([]);

  return (
    <div>
      <Ariakit.ComboboxProvider
        defaultSelectedValue="Apple"
        virtualFocus={virtualFocus}
      >
        <Ariakit.ComboboxSelect aria-label={label} />
        {/* The list stays visible while the select is collapsed, which is
            also what an exit transition leaves behind while it runs. */}
        <Ariakit.ComboboxList alwaysVisible aria-label={`${label} options`}>
          {fruits.map((value) => (
            // With virtual focus, DOM focus lands on the item and is handed
            // straight back to the select, and the select's own blur event is
            // stopped on the way out. Recording it here is the only way to
            // observe that an item was focused at all.
            <Ariakit.ComboboxItem
              key={value}
              value={value}
              onFocus={() => setFocusedItems((items) => [...items, value])}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxProvider>
      <p>
        Focused options:{" "}
        <output aria-label={`${label} focused options`}>
          {focusedItems.join(", ") || "none"}
        </output>
      </p>
    </div>
  );
}

export default function Example() {
  return (
    <>
      <FruitSelect label="Fruit" />
      <FruitSelect label="Fruit without virtual focus" virtualFocus={false} />
    </>
  );
}
