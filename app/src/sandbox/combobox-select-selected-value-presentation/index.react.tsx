import * as Ariakit from "@ariakit/react";
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
  /** Puts the element focus moves to outside the popup instead of inside it. */
  outsideFocusTarget?: boolean;
  unmountOnHide?: boolean;
  virtualFocus?: boolean;
}

function Fixture({
  defaultSelectedValue,
  focusTarget,
  input,
  label,
  moveFocusOnOpen,
  outsideFocusTarget,
  unmountOnHide,
  virtualFocus,
}: FixtureProps) {
  const focusTargetRef = useRef<HTMLElement | null>(null);
  const setFocusTarget = (element: HTMLElement | null) => {
    focusTargetRef.current = element;
  };
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue={defaultSelectedValue}
      virtualFocus={virtualFocus}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect style={{ display: "block" }} />
      <Ariakit.ComboboxPopover
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
              queueMicrotask(() => {
                // An in-popup target is meant to be scrolled into its popup by
                // this focus. A page-level one is not: letting the browser
                // scroll to it would put the fixture's own movement in the way
                // of what the test measures.
                focusTargetRef.current?.focus({
                  preventScroll: outsideFocusTarget,
                });
              });
            }}
          />
        )}
        {focusTarget && !outsideFocusTarget && (
          <Ariakit.ComboboxItem
            ref={setFocusTarget}
            style={{ display: "block", padding: "4px 8px" }}
            value="Focus target"
          />
        )}
        {fruits.map((fruit) => (
          <Ariakit.ComboboxItem
            key={fruit}
            value={fruit}
            style={{ display: "block", padding: "4px 8px" }}
          />
        ))}
        {/* An item rendered without a value, at the end of the list so it's
        always out of view. */}
        <Ariakit.ComboboxItem style={{ display: "block", padding: "4px 8px" }}>
          {`No ${label.toLowerCase()}`}
        </Ariakit.ComboboxItem>
      </Ariakit.ComboboxPopover>
      {focusTarget && outsideFocusTarget && (
        <button type="button" tabIndex={0} ref={setFocusTarget}>
          {`${label} focus target`}
        </button>
      )}
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
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
      {/* Virtual focus, and focus leaves the popup entirely while it is still
      being positioned. The presentation the open scheduled must be abandoned
      rather than pulling focus back, and it must not move the page on its way
      out. */}
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          focusTarget
          input
          label="Escaping fruit"
          moveFocusOnOpen
          outsideFocusTarget
          unmountOnHide
        />
      </div>
    </>
  );
}
