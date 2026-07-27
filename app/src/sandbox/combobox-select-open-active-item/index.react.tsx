import * as Ariakit from "@ariakit/react";

const fruits = ["Apple", "Banana", "Grape", "Orange"];
const statuses = ["Draft", "Published", "Archived"];

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

function ClosedAlwaysVisibleSelect() {
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue="Explicit hover first"
      virtualFocus={false}
    >
      <Ariakit.ComboboxSelect aria-label="Always-visible hover select" />
      <Ariakit.ComboboxList alwaysVisible aria-label="Always-visible options">
        <Ariakit.ComboboxItem focusOnHover value="Explicit hover first" />
        <Ariakit.ComboboxItem focusOnHover value="Explicit hover second" />
      </Ariakit.ComboboxList>
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
      <ClosedAlwaysVisibleSelect />
      <FocusOwnerSelect label="No-autofocus status" />
      <FocusOwnerSelect label="Real-focus status" virtualFocus={false} />
    </>
  );
}
