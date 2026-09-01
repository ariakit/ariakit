import * as Ariakit from "@ariakit/react";

const seededItems = [{ id: "seeded-drafts" }, { id: "seeded-sent" }];

// The items are not wrapped in a composite element, so this store never
// publishes compositeElement, and its items must still use roving tabindex.
function ContainerlessListbox() {
  return (
    <Ariakit.CompositeProvider>
      <div role="listbox" aria-label="Containerless">
        <Ariakit.CompositeItem role="option">Starred</Ariakit.CompositeItem>
        <Ariakit.CompositeItem role="option">Snoozed</Ariakit.CompositeItem>
      </div>
    </Ariakit.CompositeProvider>
  );
}

function VirtualFocusListbox() {
  return (
    <Ariakit.CompositeProvider virtualFocus>
      <Ariakit.Composite role="listbox" aria-label="Virtual focus">
        <Ariakit.CompositeItem role="option">Inbox</Ariakit.CompositeItem>
        <Ariakit.CompositeItem role="option">Archive</Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

function UnsupportedVirtualFocusListbox() {
  return (
    <Ariakit.CompositeProvider virtualFocus>
      <Ariakit.Composite
        role="listbox"
        aria-label="Unsupported virtual focus"
        focusable={false}
      >
        <Ariakit.CompositeItem role="option">Primary</Ariakit.CompositeItem>
        <Ariakit.CompositeItem role="option">Social</Ariakit.CompositeItem>
        <Ariakit.CompositeItem role="option">Updates</Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

// The store is seeded with items, so its items are already known on the first
// render while the rendered items are still empty. Tabbability must follow the
// rendered items, not the seeded ones.
function SeededListbox() {
  return (
    <Ariakit.CompositeProvider virtualFocus defaultItems={seededItems}>
      <Ariakit.Composite role="listbox" aria-label="Seeded">
        <Ariakit.CompositeItem id="seeded-drafts" role="option">
          Drafts
        </Ariakit.CompositeItem>
        <Ariakit.CompositeItem id="seeded-sent" role="option">
          Sent
        </Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

function RovingListbox() {
  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite role="listbox" aria-label="Roving">
        <Ariakit.CompositeItem role="option">Spam</Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

function InheritedAccessibleDisabledListbox() {
  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite
        role="listbox"
        aria-label="Inherited accessible disabled"
      >
        <Ariakit.CompositeItem id="inherited-one" role="option">
          Inherited one
        </Ariakit.CompositeItem>
        <Ariakit.Focusable
          disabled
          accessibleWhenDisabled
          render={<Ariakit.CompositeItem id="inherited-two" role="option" />}
        >
          Inherited two
        </Ariakit.Focusable>
        <Ariakit.CompositeItem id="inherited-three" role="option">
          Inherited three
        </Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

function RenderedAccessibleDisabledListbox() {
  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite
        role="listbox"
        aria-label="Rendered accessible disabled"
      >
        <Ariakit.CompositeItem role="option">
          Rendered one
        </Ariakit.CompositeItem>
        <Ariakit.CompositeItem
          disabled
          role="option"
          render={<Ariakit.Focusable accessibleWhenDisabled />}
        >
          Rendered two
        </Ariakit.CompositeItem>
        <Ariakit.CompositeItem role="option">
          Rendered three
        </Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

function NestedDisabledOverrideListbox() {
  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite role="listbox" aria-label="Nested disabled override">
        <Ariakit.CompositeItem role="option">Nested one</Ariakit.CompositeItem>
        <Ariakit.Focusable
          disabled
          accessibleWhenDisabled
          render={
            <Ariakit.CompositeItem
              role="option"
              render={
                <Ariakit.Focusable
                  accessibleWhenDisabled={false}
                  render={<button type="button" />}
                />
              }
            />
          }
        >
          Nested two
        </Ariakit.Focusable>
        <Ariakit.CompositeItem role="option">
          Nested three
        </Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

function InactiveFocusableListbox() {
  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite role="listbox" aria-label="Inactive focusable">
        <Ariakit.CompositeItem role="option">
          Inactive one
        </Ariakit.CompositeItem>
        <Ariakit.CompositeItem disabled focusable={false} role="option">
          Inactive two
        </Ariakit.CompositeItem>
        <Ariakit.CompositeItem role="option">
          Inactive three
        </Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

function RenderedInactiveFocusableListbox() {
  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite
        role="listbox"
        aria-label="Rendered inactive focusable"
      >
        <Ariakit.CompositeItem role="option">
          Rendered inactive one
        </Ariakit.CompositeItem>
        <Ariakit.CompositeItem
          disabled
          role="option"
          render={<Ariakit.Focusable focusable={false} />}
        >
          Rendered inactive two
        </Ariakit.CompositeItem>
        <Ariakit.CompositeItem role="option">
          Rendered inactive three
        </Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

export default function Example() {
  return (
    <>
      <ContainerlessListbox />
      <VirtualFocusListbox />
      <UnsupportedVirtualFocusListbox />
      <SeededListbox />
      <RovingListbox />
      <InheritedAccessibleDisabledListbox />
      <RenderedAccessibleDisabledListbox />
      <NestedDisabledOverrideListbox />
      <InactiveFocusableListbox />
      <RenderedInactiveFocusableListbox />
    </>
  );
}
