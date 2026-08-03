import * as Ariakit from "@ariakit/react";
import { useEffect, useRef, useState } from "react";

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

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

interface FruitItemsProps {
  /**
   * Renders explicit item ids, so an item that is replaced comes back under the
   * id the store already points at. React generates a new id per mount, which
   * would make the replacement a different logical item.
   */
  idPrefix?: string;
}

function FruitItems({ idPrefix }: FruitItemsProps) {
  return (
    <>
      {fruits.map((fruit) => (
        <Ariakit.ComboboxItem
          key={fruit}
          id={idPrefix ? `${idPrefix}-${slugify(fruit)}` : undefined}
          value={fruit}
          style={{ display: "block", padding: "4px 8px" }}
        />
      ))}
    </>
  );
}

/**
 * Renders the fruit list under a fresh React key every time the popup opens,
 * the way an app that swaps in a freshly loaded list does. Every item node is
 * replaced while the popup is still being positioned, but their ids keep
 * pointing at the same logical items.
 */
function RemountingFruitItems({ idPrefix }: FruitItemsProps) {
  const combobox = Ariakit.useComboboxContext();
  const mounted = Ariakit.useStoreState(combobox, "mounted");
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    if (!mounted) return;
    setGeneration((value) => value + 1);
  }, [mounted]);

  return <FruitItems key={generation} idPrefix={idPrefix} />;
}

interface FixtureProps {
  /** Lets a variant turn off the popup's own initial focus. */
  autoFocusOnShow?: boolean;
  defaultSelectedValue: string | string[];
  focusTarget?: boolean;
  input?: boolean;
  /** Renders explicit item ids under this prefix. */
  itemIdPrefix?: string;
  label: string;
  moveFocusOnOpen?: boolean;
  /** Puts the element focus moves to outside the popup instead of inside it. */
  outsideFocusTarget?: boolean;
  /** Replaces every item node under a stable id while the popup opens. */
  remountItemsOnOpen?: boolean;
  unmountOnHide?: boolean;
  virtualFocus?: boolean;
}

function Fixture({
  autoFocusOnShow,
  defaultSelectedValue,
  focusTarget,
  input,
  itemIdPrefix,
  label,
  moveFocusOnOpen,
  outsideFocusTarget,
  remountItemsOnOpen,
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
        // Spread conditionally: the popover reads this prop off the rest, so an
        // explicit `undefined` would still take precedence over the default it
        // computes for itself, which the other variants are meant to exercise.
        {...(autoFocusOnShow != null && { autoFocusOnShow })}
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
        {remountItemsOnOpen ? (
          <RemountingFruitItems idPrefix={itemIdPrefix} />
        ) : (
          <FruitItems idPrefix={itemIdPrefix} />
        )}
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
      {/* Both variants below turn off the popup's own initial focus, so the
      presentation the open scheduled is the only thing left that can bring the
      selected item into view. They differ only in whether the item nodes are
      replaced while the popup is still being positioned: "Persisting fruit"
      keeps them, "Remounting fruit" replaces every one of them. */}
      <div style={{ marginTop: 200 }}>
        <Fixture
          autoFocusOnShow={false}
          defaultSelectedValue="Watermelon"
          itemIdPrefix="persisting"
          label="Persisting fruit"
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          autoFocusOnShow={false}
          defaultSelectedValue="Watermelon"
          itemIdPrefix="remounting"
          label="Remounting fruit"
          remountItemsOnOpen
        />
      </div>
    </>
  );
}
