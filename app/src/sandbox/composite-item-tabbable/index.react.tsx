import * as Ariakit from "@ariakit/react";
import { useState } from "react";

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

function AccessibleDisabledOverrideListbox() {
  const [accessible, setAccessible] = useState(false);
  const [renderAsLink, setRenderAsLink] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAccessible(!accessible)}>
        Make override {accessible ? "inaccessible" : "accessible"}
      </button>
      <button
        type="button"
        onClick={() => {
          setAccessible(!renderAsLink);
          setRenderAsLink(!renderAsLink);
        }}
      >
        Replace with {renderAsLink ? "inaccessible div" : "accessible link"}
      </button>
      <Ariakit.CompositeProvider>
        <Ariakit.Composite
          role="listbox"
          aria-label="Accessible disabled override"
        >
          <Ariakit.CompositeItem id="override-one" role="option">
            Override one
          </Ariakit.CompositeItem>
          <Ariakit.Focusable
            disabled
            accessibleWhenDisabled
            render={
              <Ariakit.CompositeItem
                id="override-two"
                role="option"
                render={
                  <Ariakit.Focusable
                    accessibleWhenDisabled={accessible}
                    render={
                      renderAsLink ? <a href="#override-two" /> : undefined
                    }
                  />
                }
              />
            }
          >
            Override two
          </Ariakit.Focusable>
          <Ariakit.CompositeItem id="override-three" role="option">
            Override three
          </Ariakit.CompositeItem>
        </Ariakit.Composite>
      </Ariakit.CompositeProvider>
    </>
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
      <AccessibleDisabledOverrideListbox />
    </>
  );
}
