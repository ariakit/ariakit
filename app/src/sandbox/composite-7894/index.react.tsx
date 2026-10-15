import * as Ariakit from "@ariakit/react";

interface ContactsGridProps {
  label: string;
  orientation: Ariakit.CompositeProviderProps["orientation"];
}

// A shared grid wrapper that forwards orientation, which has no effect on
// two-dimensional composites.
function ContactsGrid({ label, orientation }: ContactsGridProps) {
  return (
    <Ariakit.CompositeProvider orientation={orientation}>
      <Ariakit.Composite role="grid" aria-label={label}>
        {["First", "Second"].map((contact) => (
          <Ariakit.CompositeRow key={contact} role="row">
            <div role="gridcell">
              <Ariakit.CompositeItem
                aria-label={`${contact} contact name`}
                render={<input />}
              />
            </div>
            <div role="gridcell">
              <Ariakit.CompositeItem
                aria-label={`${contact} contact notes`}
                render={<textarea />}
              />
            </div>
          </Ariakit.CompositeRow>
        ))}
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

export default function Example() {
  return (
    <main>
      <ContactsGrid label="Vertical contacts" orientation="vertical" />
      <ContactsGrid label="Horizontal contacts" orientation="horizontal" />
      <ContactsGrid label="Both contacts" orientation="both" />
    </main>
  );
}
