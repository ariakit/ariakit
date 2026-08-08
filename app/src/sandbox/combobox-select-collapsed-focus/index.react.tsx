import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const fruits = ["Apple", "Banana", "Grape", "Orange"];

interface FruitSelectProps {
  label: string;
  virtualFocus?: boolean;
}

function FruitSelect({ label, virtualFocus }: FruitSelectProps) {
  const [focusedItems, setFocusedItems] = useState<string[]>([]);
  const store = Ariakit.useComboboxStore({
    defaultSelectedValue: "Apple",
    virtualFocus,
  });
  const open = Ariakit.useStoreState(store, "open");
  // `ComboboxSelect` forwards composite options to `useComposite`, but it
  // doesn't list them in its own props type, so they are spread in.
  const focusOnMoveProps = {
    focusOnMove: open,
  } satisfies Ariakit.CompositeOptions;

  return (
    <div>
      <Ariakit.ComboboxProvider store={store}>
        <Ariakit.ComboboxSelect
          aria-label={label}
          // TODO: remove both workarounds once
          // https://github.com/ariakit/ariakit/issues/7093 is fixed. The prop
          // stops the closed moves from presenting an item, and the handler
          // stops the presentation that virtual focus queues when the
          // collapsed select itself is focused.
          {...focusOnMoveProps}
          onFocus={(event) => {
            const state = store.getState();
            if (state.open) return;
            if (!state.virtualFocus) return;
            event.preventDefault();
          }}
        />
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
