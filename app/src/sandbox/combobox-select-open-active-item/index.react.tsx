import * as Ariakit from "@ariakit/react";
import { useRef } from "react";

const fruits = ["Apple", "Banana", "Grape", "Orange"];
const statuses = ["Draft", "Published", "Archived"];
const vegetables = [
  "Artichoke",
  "Broccoli",
  "Carrot",
  "Garlic",
  "Leek",
  "Lettuce",
  "Onion",
];

interface SelectProps {
  label: string;
  values: string[];
  defaultSelectedValue: string | string[];
  unmount: boolean;
}

function Select({ label, values, defaultSelectedValue, unmount }: SelectProps) {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue={defaultSelectedValue}>
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover unmountOnHide={unmount}>
        {values.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

interface FocusOwnerSelectProps {
  label: string;
  virtualFocus?: boolean;
}

function FocusOwnerSelect({ label, virtualFocus }: FocusOwnerSelectProps) {
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue="Draft"
      virtualFocus={virtualFocus}
    >
      <Ariakit.ComboboxSelect aria-label={label} />
      <Ariakit.ComboboxPopover
        aria-label={`${label} options`}
        autoFocusOnShow={false}
      >
        <Ariakit.ComboboxInput aria-label={`${label} filter`} />
        {statuses.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

// Holds the popup at its unplaced origin until the button releases the
// positioning, so the user can move through the items before the popup takes
// focus.
function PositioningSelect() {
  const releaseRef = useRef<(() => void) | null>(null);
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Artichoke">
      <Ariakit.ComboboxSelectLabel>Vegetable</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover
        // The button that releases the positioning is outside the popup.
        hideOnInteractOutside={false}
        updatePosition={({ updatePosition }) =>
          new Promise<void>((resolve) => {
            releaseRef.current = () => {
              void updatePosition().then(resolve);
            };
          })
        }
      >
        {vegetables.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxPopover>
      {/* Refuses focus so the select keeps it, as it would when positioning
      ends on its own. */}
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => releaseRef.current?.()}
      >
        Finish vegetable positioning
      </button>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
      <Select
        label="Mounted fruit"
        values={fruits}
        defaultSelectedValue="Orange"
        unmount={false}
      />
      <Select
        label="Unmounted fruit"
        values={fruits}
        defaultSelectedValue="Orange"
        unmount
      />
      {/* Mirrors the multi-selectable Status select in the select-next-router
      example: nothing is selected initially, so there's no active item to fall
      back to when the arrow keys start moving through the open popup. */}
      <Select
        label="Status"
        values={statuses}
        defaultSelectedValue={[]}
        unmount={false}
      />
      <FocusOwnerSelect label="No-autofocus status" />
      <FocusOwnerSelect label="Real-focus status" virtualFocus={false} />
      <PositioningSelect />
    </>
  );
}
