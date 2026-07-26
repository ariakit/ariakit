import * as Ariakit from "@ariakit/react";
import { ComboboxItem } from "@ariakit/react-components/combobox/combobox-item-offscreen";
import { useRef } from "react";

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Cherry",
  "Clementine",
  "Coconut",
  "Cranberry",
  "Date",
  "Dragon fruit",
  "Durian",
  "Elderberry",
  "Fig",
  "Grape",
  "Grapefruit",
  "Guava",
  "Honeydew",
  "Jackfruit",
  "Kiwi",
  "Kumquat",
  "Lemon",
  "Lime",
  "Lychee",
  "Mango",
  "Melon",
  "Nectarine",
  "Orange",
  "Papaya",
  "Peach",
  "Pear",
  "Pineapple",
  "Plum",
  "Pomegranate",
  "Quince",
  "Raspberry",
  "Strawberry",
  "Watermelon",
];

interface FixtureProps {
  defaultSelectedValue: string | string[];
  focusTarget?: boolean;
  input?: boolean;
  label: string;
  moveFocusOnOpen?: boolean;
  virtualFocus?: boolean;
}

function Fixture({
  defaultSelectedValue,
  focusTarget,
  input,
  label,
  moveFocusOnOpen,
  virtualFocus,
}: FixtureProps) {
  const focusTargetRef = useRef<HTMLDivElement>(null);
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue={defaultSelectedValue}
      virtualFocus={virtualFocus}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect style={{ display: "block" }} />
      <Ariakit.ComboboxPopover
        gutter={4}
        sameWidth
        style={{
          background: "white",
          border: "1px solid gray",
          maxHeight: 120,
          overflow: "auto",
        }}
      >
        {input && (
          <Ariakit.ComboboxInput
            aria-label={`Search ${label}`}
            onFocus={() => {
              if (!moveFocusOnOpen) return;
              queueMicrotask(() => focusTargetRef.current?.focus());
            }}
          />
        )}
        {focusTarget && (
          <Ariakit.ComboboxItem
            ref={focusTargetRef}
            style={{ display: "block", padding: "4px 8px" }}
            value="Focus target"
          />
        )}
        {fruits.map((fruit) => (
          <ComboboxItem
            key={fruit}
            value={fruit}
            offscreenMode="passive"
            style={{ display: "block", padding: "4px 8px" }}
          />
        ))}
        {/* An item rendered without a value, at the end of the list so it's
        always out of view. */}
        <ComboboxItem
          offscreenMode="passive"
          style={{ display: "block", padding: "4px 8px" }}
        >
          {`No ${label.toLowerCase()}`}
        </ComboboxItem>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
      <Fixture defaultSelectedValue={[]} label="Fruit" />
      <Fixture defaultSelectedValue={["Apple"]} label="Selected fruit" />
      <Fixture defaultSelectedValue="Apple" label="Single selected fruit" />
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          input
          label="Filterable fruit"
          virtualFocus={false}
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          focusTarget
          input
          label="Focus moving filterable fruit"
          moveFocusOnOpen
          virtualFocus={false}
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          input
          label="Touch filterable fruit"
        />
      </div>
    </>
  );
}
