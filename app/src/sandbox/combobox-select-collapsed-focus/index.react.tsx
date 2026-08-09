import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const fruits = ["Apple", "Banana", "Grape", "Orange"];

interface FocusedOptionsProps {
  label: string;
  items: string[];
}

function FocusedOptions({ label, items }: FocusedOptionsProps) {
  return (
    <p>
      Focused options:{" "}
      <output aria-label={`${label} focused options`}>
        {items.join(", ") || "none"}
      </output>
    </p>
  );
}

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
      <FocusedOptions label={label} items={focusedItems} />
    </div>
  );
}

// Enough options that the typeahead target starts outside the scrollport, so
// the list has somewhere to scroll while the select is collapsed.
const codes = [
  ...Array.from({ length: 29 }, (_, index) => `Alpha ${index + 1}`),
  "Zulu",
];

function CodeSelect() {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Alpha 1">
      <Ariakit.ComboboxSelect aria-label="Code" />
      <Ariakit.ComboboxList
        alwaysVisible
        aria-label="Code options"
        style={{ maxHeight: 80, overflowY: "auto" }}
      >
        {codes.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxList>
    </Ariakit.ComboboxProvider>
  );
}

const stages = ["Draft", "Review", "Final"];

// Driven from outside the widget, the way an "apply preset" button or a router
// effect would, so the move happens while focus is elsewhere on the page.
function StageSelect() {
  const store = Ariakit.useComboboxStore({
    defaultSelectedValue: "Draft",
    virtualFocus: false,
  });

  return (
    <div>
      <Ariakit.ComboboxProvider store={store}>
        <Ariakit.ComboboxSelect aria-label="Stage" />
        <Ariakit.ComboboxList alwaysVisible aria-label="Stage options">
          {stages.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxProvider>
      {/* Safari only focuses a clicked button when it has an explicit
          tabindex, and these tests assert where the click left focus. */}
      <button
        type="button"
        tabIndex={0}
        onClick={() => store.move(store.last())}
      >
        Apply stage preset
      </button>
      <button type="button" tabIndex={0} onClick={() => store.show()}>
        Open stage list
      </button>
    </div>
  );
}

// The same contract without a select: the input is the composite element and
// the options live in a list outside it, so a collapsed input must not focus
// them either.
function FilterCombobox() {
  const [focusedItems, setFocusedItems] = useState<string[]>([]);

  return (
    <div>
      <Ariakit.ComboboxProvider defaultActiveId="filter-banana">
        <Ariakit.Combobox aria-label="Filter" />
        <Ariakit.ComboboxList alwaysVisible aria-label="Filter options">
          {fruits.map((value) => (
            <Ariakit.ComboboxItem
              key={value}
              id={`filter-${value.toLowerCase()}`}
              value={value}
              onFocus={() => setFocusedItems((items) => [...items, value])}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxProvider>
      <FocusedOptions label="Filter" items={focusedItems} />
    </div>
  );
}

export default function Example() {
  return (
    <>
      <FruitSelect label="Fruit" />
      <FruitSelect label="Fruit without virtual focus" virtualFocus={false} />
      <CodeSelect />
      <StageSelect />
      <FilterCombobox />
    </>
  );
}
