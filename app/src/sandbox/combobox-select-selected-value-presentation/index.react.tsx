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

interface RefreshListButtonProps {
  /** The item the refreshed list highlights. */
  activeId: string;
  label: string;
  onRefresh: () => void;
}

/**
 * Refreshes the list and highlights a different item in one action, the way an
 * app that re-runs its query and points at the new best match does. Neither
 * half moves, so neither supersedes the request this fixture parks, and that
 * request carries no `id`, so a changed active item doesn't end it either.
 *
 * The highlight is a synchronous store write and the replacement only lands on
 * the commit after it, which is what puts the new active item in place before
 * anything resolves again. Deferring the highlight would remove that ordering,
 * and with it the only thing a re-resolution could get wrong.
 */
function RefreshListButton({
  activeId,
  label,
  onRefresh,
}: RefreshListButtonProps) {
  const combobox = Ariakit.useComboboxContext();
  return (
    // Refuses the focus a click would take, because moving focus out of the
    // composite abandons the request this exists to exercise.
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        combobox?.setActiveId(activeId);
        onRefresh();
      }}
    >
      {`Refresh ${label} list`}
    </button>
  );
}

interface FixtureProps {
  /**
   * Whether the popup takes focus once it is placed. Turning it off leaves the
   * presentation as the only thing that can bring an item into view, and keeps
   * a focus escape from being undone by the popup pulling focus back in, which
   * is a separate defect. Once that one is fixed, the fixture that turns this
   * off to hold a focus escape can go back to the default and cover the same
   * escape there.
   * See https://github.com/ariakit/ariakit/issues/7033
   */
  autoFocusOnShow?: boolean;
  defaultSelectedValue: string | string[];
  focusTarget?: boolean;
  /**
   * Holds the popup in its positioning window until a control releases it, so a
   * presentation stays parked while something else acts on the popup. Releasing
   * only ends the wait: this never calls the positioning it is handed, so the
   * popup stays at its pre-placement origin, away from its select.
   */
  holdPlacement?: boolean;
  input?: boolean;
  /** Renders explicit item ids under this prefix. */
  itemIdPrefix?: string;
  /** Keeps the popup open while focus leaves it. */
  keepOpen?: boolean;
  label: string;
  moveFocusOnOpen?: boolean;
  /** Puts the element focus moves to outside the popup instead of inside it. */
  outsideFocusTarget?: boolean;
  /**
   * Drops the popup's own scrollport so the nearest scrollport for its items is
   * the page, which is what makes a stale presentation move the page rather
   * than the popup's list.
   */
  pageScrollport?: boolean;
  /**
   * Adds a control that highlights this item and replaces every item node under
   * a stable id. Its replacement half is ignored alongside
   * `remountItemsOnOpen`, which owns the item keys.
   */
  refreshListActiveId?: string;
  /** Replaces every item node under a stable id while the popup opens. */
  remountItemsOnOpen?: boolean;
  unmountOnHide?: boolean;
  virtualFocus?: boolean;
}

function Fixture({
  autoFocusOnShow,
  defaultSelectedValue,
  focusTarget,
  holdPlacement,
  input,
  itemIdPrefix,
  keepOpen,
  label,
  moveFocusOnOpen,
  outsideFocusTarget,
  pageScrollport,
  refreshListActiveId,
  remountItemsOnOpen,
  unmountOnHide,
  virtualFocus,
}: FixtureProps) {
  const focusTargetRef = useRef<HTMLElement | null>(null);
  const setFocusTarget = (element: HTMLElement | null) => {
    focusTargetRef.current = element;
  };
  const releaseRef = useRef<(() => void) | null>(null);
  const [generation, setGeneration] = useState(0);
  const updatePosition = () =>
    new Promise<void>((resolve) => {
      releaseRef.current = resolve;
    });
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue={defaultSelectedValue}
      virtualFocus={virtualFocus}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect style={{ display: "block" }} />
      <Ariakit.ComboboxPopover
        autoFocusOnShow={autoFocusOnShow}
        {...(holdPlacement ? { updatePosition } : null)}
        unmountOnHide={unmountOnHide}
        hideOnInteractOutside={!keepOpen}
        // A popup that is taller than the viewport would otherwise be flipped
        // above the select, which puts the last items back in view.
        flip={!pageScrollport}
        gutter={4}
        sameWidth
        style={{
          background: "white",
          border: "1px solid gray",
          ...(pageScrollport ? null : { maxHeight: 120, overflow: "auto" }),
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
          <FruitItems key={generation} idPrefix={itemIdPrefix} />
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
      {refreshListActiveId && (
        <RefreshListButton
          activeId={refreshListActiveId}
          label={label}
          onRefresh={() => setGeneration((value) => value + 1)}
        />
      )}
      {holdPlacement && (
        // Refuses focus for the same reason as `RefreshListButton`.
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            releaseRef.current?.();
            releaseRef.current = null;
          }}
        >
          {`Finish ${label} positioning`}
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
      {/* The same escape, against a popup that keeps itself open and has no
      scrollport of its own. Nothing left to scroll but the page, so a
      presentation that outlives the escape is visible as a page jump. */}
      <div style={{ marginTop: 200 }}>
        <Fixture
          autoFocusOnShow={false}
          defaultSelectedValue="Watermelon"
          focusTarget
          input
          keepOpen
          label="Page escaping fruit"
          moveFocusOnOpen
          outsideFocusTarget
          pageScrollport
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
      {/* The replacement is driven by a control rather than the open, so it can
      land once the active item has already moved on. The request adopted the
      selected item and nothing abandoned it, so it stays on that one: the newly
      highlighted item is not a presentation target and was never asked for. */}
      <div style={{ marginTop: 200 }}>
        <Fixture
          autoFocusOnShow={false}
          defaultSelectedValue="Watermelon"
          holdPlacement
          itemIdPrefix="parked"
          keepOpen
          label="Parked fruit"
          refreshListActiveId="parked-apple"
        />
      </div>
    </>
  );
}
