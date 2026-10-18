import * as Ariakit from "@ariakit/react";

interface ContactsGridProps {
  label: string;
  orientation: Ariakit.CompositeProviderProps["orientation"];
}

const fieldClassName = "rounded border border-gray-400 p-1";

// A shared grid wrapper that forwards orientation, which has no effect on
// two-dimensional composites.
function ContactsGrid({ label, orientation }: ContactsGridProps) {
  return (
    <section className="grid gap-2">
      <h2 className="font-semibold">{label}</h2>
      <Ariakit.CompositeProvider orientation={orientation}>
        <Ariakit.Composite
          role="grid"
          aria-label={label}
          className="grid gap-2"
        >
          {["First", "Second"].map((contact) => (
            <Ariakit.CompositeRow
              key={contact}
              role="row"
              className="grid grid-cols-2 gap-2"
            >
              <div role="gridcell">
                <label className="grid gap-1">
                  {contact} contact name
                  <Ariakit.CompositeItem
                    render={<input className={fieldClassName} />}
                  />
                </label>
              </div>
              <div role="gridcell">
                <label className="grid gap-1">
                  {contact} contact notes
                  <Ariakit.CompositeItem
                    render={<textarea className={fieldClassName} />}
                  />
                </label>
              </div>
            </Ariakit.CompositeRow>
          ))}
        </Ariakit.Composite>
      </Ariakit.CompositeProvider>
    </section>
  );
}

export default function Example() {
  return (
    <main className="grid max-w-xl gap-6 p-4">
      <ContactsGrid label="Vertical contacts" orientation="vertical" />
      <ContactsGrid label="Horizontal contacts" orientation="horizontal" />
      <ContactsGrid label="Both contacts" orientation="both" />
    </main>
  );
}
