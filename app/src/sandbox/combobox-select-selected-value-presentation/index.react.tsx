import * as Ariakit from "@ariakit/react";
import { useRef, useState } from "react";

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

const defaultOpenFruits = fruits.map((fruit) => `Default ${fruit}`);
const legacyFruits = fruits.map((fruit) => `Legacy ${fruit}`);

interface FixtureProps {
  autoFocusOnShow?: boolean;
  defaultOpen?: boolean;
  defaultSelectedValue: string | string[];
  focusTarget?: boolean;
  input?: boolean;
  items?: readonly string[];
  label: string;
  lateItems?: boolean;
  moveFocusOnOpen?: boolean;
  selectOnMove?: boolean;
  unmountOnHide?: boolean;
  virtualFocus?: boolean;
}

function Fixture({
  autoFocusOnShow,
  defaultOpen,
  defaultSelectedValue,
  focusTarget,
  input,
  items = fruits,
  label,
  lateItems,
  moveFocusOnOpen,
  selectOnMove,
  unmountOnHide,
  virtualFocus,
}: FixtureProps) {
  const focusTargetRef = useRef<HTMLDivElement>(null);
  const [showLateItems, setShowLateItems] = useState(!lateItems);
  const renderedItems = showLateItems ? items : items.slice(0, 3);
  return (
    <div>
      <Ariakit.ComboboxProvider
        defaultOpen={defaultOpen}
        defaultSelectedValue={defaultSelectedValue}
        selectOnMove={selectOnMove}
        virtualFocus={virtualFocus}
      >
        <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect style={{ display: "block" }} />
        <Ariakit.ComboboxPopover
          {...(autoFocusOnShow === undefined ? {} : { autoFocusOnShow })}
          unmountOnHide={unmountOnHide}
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
          {renderedItems.map((fruit) => (
            <Ariakit.ComboboxItem
              key={fruit}
              value={fruit}
              style={{ display: "block", padding: "4px 8px" }}
            />
          ))}
          {/* An item rendered without a value, at the end of the list so it's
          always out of view. */}
          <Ariakit.ComboboxItem
            style={{ display: "block", padding: "4px 8px" }}
          >
            {`No ${label.toLowerCase()}`}
          </Ariakit.ComboboxItem>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      {lateItems && !showLateItems && (
        <button
          type="button"
          tabIndex={0}
          onClick={() => setShowLateItems(true)}
        >
          Register {label} items
        </button>
      )}
    </div>
  );
}

function DefaultOpenFixture() {
  const [mounted, setMounted] = useState(false);
  return (
    <div>
      <button type="button" tabIndex={0} onClick={() => setMounted(true)}>
        Mount default-open fruit picker
      </button>
      {mounted && (
        <Fixture
          autoFocusOnShow={false}
          defaultOpen
          defaultSelectedValue="Default Watermelon"
          items={defaultOpenFruits}
          label="Default-open fruit"
          virtualFocus
        />
      )}
    </div>
  );
}

function LegacySelectFixture() {
  return (
    <Ariakit.SelectProvider defaultValue="Legacy Watermelon">
      <Ariakit.SelectLabel>Legacy fruit</Ariakit.SelectLabel>
      <Ariakit.Select style={{ display: "block" }} />
      <Ariakit.SelectPopover
        gutter={4}
        sameWidth
        style={{
          background: "white",
          border: "1px solid gray",
          maxHeight: 120,
          overflow: "auto",
        }}
      >
        {legacyFruits.map((fruit) => (
          <Ariakit.SelectItem
            key={fruit}
            value={fruit}
            style={{ display: "block", padding: "4px 8px" }}
          />
        ))}
        <div aria-hidden style={{ minHeight: 80 }} />
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}

export default function Example() {
  return (
    <>
      <Fixture
        defaultSelectedValue={["Apple", "Watermelon"]}
        label="Selected fruit"
        selectOnMove
        virtualFocus
      />
      <Fixture defaultSelectedValue="Apple" label="Single selected fruit" />
      <div
        data-testid="centered-fruit-scroll-container"
        style={{ height: 240, overflow: "auto" }}
      >
        <div style={{ height: 160 }} />
        <Fixture defaultSelectedValue="Cherry" label="Centered fruit" />
        <div style={{ height: 320 }} />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          input
          label="Filterable fruit"
          unmountOnHide
          virtualFocus={false}
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          label="Real-focus unmounted fruit"
          unmountOnHide
          virtualFocus={false}
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          label="Late selected fruit"
          lateItems
          virtualFocus
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
        {/* The popup unmounts while hidden, so the select element is briefly
        the composite again on each open. */}
        <Fixture
          defaultSelectedValue="Watermelon"
          focusTarget
          input
          label="Focus moving unmounted fruit"
          moveFocusOnOpen
          unmountOnHide
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
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          input
          label="Virtual focus fruit"
          selectOnMove
          virtualFocus
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <DefaultOpenFixture />
      </div>
      <div style={{ marginTop: 200 }}>
        <LegacySelectFixture />
      </div>
    </>
  );
}
