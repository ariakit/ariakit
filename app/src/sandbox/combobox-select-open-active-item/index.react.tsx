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

interface PositioningSelectProps {
  label: string;
  virtualFocus?: boolean;
  /** Renders a button with this text and `autoFocus` before the items. */
  autoFocusButton?: string;
  /**
   * Passes the store to the select directly, while the popup still reads it
   * from the provider, which wraps it in a store of its own.
   */
  selectStoreProp?: boolean;
  /** Mounts the popup only once it opens. */
  unmountOnHide?: boolean;
}

// Holds the popup at its unplaced origin until the button releases the
// positioning, so the user can move through the items before the popup takes
// focus.
function PositioningSelect({
  label,
  virtualFocus,
  autoFocusButton,
  selectStoreProp,
  unmountOnHide,
}: PositioningSelectProps) {
  const releaseRef = useRef<(() => void) | null>(null);
  const combobox = Ariakit.useComboboxStore({
    defaultSelectedValue: "Artichoke",
    virtualFocus,
  });
  const name = label.toLowerCase();
  return (
    <Ariakit.ComboboxProvider store={combobox}>
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect store={selectStoreProp ? combobox : undefined} />
      <Ariakit.ComboboxPopover
        unmountOnHide={unmountOnHide}
        // The buttons that control the positioning are outside the popup.
        hideOnInteractOutside={false}
        updatePosition={({ updatePosition }) =>
          new Promise<void>((resolve) => {
            releaseRef.current = () => {
              void updatePosition().then(resolve);
            };
          })
        }
      >
        {autoFocusButton && (
          <Ariakit.Button autoFocus>{autoFocusButton}</Ariakit.Button>
        )}
        {vegetables.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxPopover>
      {/* Both buttons refuse focus so the widget keeps it, as it would when
      positioning happens on its own. */}
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => releaseRef.current?.()}
      >
        {`Finish ${name} positioning`}
      </button>
      {/* Starts another positioning pass while the popup is open, as a moved
      anchor would. */}
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={combobox.render}
      >
        {`Reposition ${name} popup`}
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
      <PositioningSelect label="Vegetable" />
      <PositioningSelect label="Real-focus vegetable" virtualFocus={false} />
      <PositioningSelect
        label="Managed vegetable"
        autoFocusButton="Manage vegetables"
      />
      <PositioningSelect label="Store-prop vegetable" selectStoreProp />
      <PositioningSelect label="Unmounted vegetable" unmountOnHide />
    </>
  );
}
