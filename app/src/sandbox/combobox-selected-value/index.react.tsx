import * as Ariakit from "@ariakit/react";

const values = ["Apple", "Banana"];

function SelectedValueExample() {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
      <Ariakit.ComboboxSelect aria-label="Favorite fruit">
        <Ariakit.ComboboxSelectedValue fallback="No fruit" />
      </Ariakit.ComboboxSelect>
      <output aria-label="Rendered favorite fruit">
        <Ariakit.ComboboxSelectedValue fallback="No fruit">
          {(value) => `Rendered fruit: ${value}`}
        </Ariakit.ComboboxSelectedValue>
      </output>
      <Ariakit.ComboboxPopover>
        <Ariakit.ComboboxHeading>Fruit options</Ariakit.ComboboxHeading>
        <Ariakit.ComboboxDismiss>Dismiss fruit options</Ariakit.ComboboxDismiss>
        <Ariakit.ComboboxList>
          {values.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value}>
              <Ariakit.ComboboxItemSelected>
                {(selected) => (
                  <span aria-hidden data-selected={selected || undefined}>
                    {selected ? "✓" : null}
                  </span>
                )}
              </Ariakit.ComboboxItemSelected>
              {value}
            </Ariakit.ComboboxItem>
          ))}
          <Ariakit.ComboboxItem value="">Clear selection</Ariakit.ComboboxItem>
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function MoveAndRestoreExample() {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Apple" selectOnMove>
      <Ariakit.ComboboxSelect aria-label="Preview fruit">
        <Ariakit.ComboboxSelectedValue />
      </Ariakit.ComboboxSelect>
      <Ariakit.ComboboxPopover aria-label="Preview fruit options">
        {values.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function DisabledFilterableSelectExample() {
  return (
    <>
      <input aria-label="Before disabled select" />
      <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
        <Ariakit.ComboboxSelect aria-label="Disabled fruit" disabled />
        <Ariakit.ComboboxPopover unmountOnHide={false}>
          <Ariakit.ComboboxInput aria-label="Disabled fruit filter" />
          {values.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <input aria-label="After disabled select" />
    </>
  );
}

function PersistentFilterExample() {
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue={[]}
      resetValueOnSelect={false}
    >
      <Ariakit.ComboboxInput aria-label="Persistent fruit filter" />
      <Ariakit.ComboboxPopover>
        {values.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function PersistentSelectFilterExample() {
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue="Apple"
      resetValueOnSelect={false}
    >
      <Ariakit.ComboboxSelect aria-label="Persistent select fruit" />
      <Ariakit.ComboboxPopover>
        <Ariakit.ComboboxInput aria-label="Persistent select fruit filter" />
        {values.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} hideOnClick={false} />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function PlainSelectionExample() {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
      <Ariakit.ComboboxInput aria-label="Plain fruit filter" />
      <output aria-label="Plain fruit selection">
        <Ariakit.ComboboxSelectedValue />
      </output>
      <Ariakit.ComboboxPopover>
        {values.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} hideOnClick={false} />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function MenuSelectionExample() {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue={["Apple"]}>
      <Ariakit.ComboboxInput aria-label="Menu fruit filter" />
      <Ariakit.ComboboxPopover role="menu">
        {values.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
      <SelectedValueExample />
      <MoveAndRestoreExample />
      <DisabledFilterableSelectExample />
      <PersistentFilterExample />
      <PersistentSelectFilterExample />
      <PlainSelectionExample />
      <MenuSelectionExample />
    </>
  );
}
