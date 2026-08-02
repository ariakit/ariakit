import * as Ariakit from "@ariakit/react";

// Enough items that the list alone is longer than a desktop viewport, so its
// last item can only be brought into view by moving the page.
const itemCount = 30;
const items = Array.from({ length: itemCount }, (_, index) => index + 1);

const itemStyle = { display: "block", padding: "12px 8px" };

/**
 * A composite that isn't inside a popup, so it has nothing to be positioned
 * relative to and no scrollport of its own. Its initially active item is marked
 * as the presentation target with `autoFocus`, the way `SelectItem` and
 * `ComboboxItem` mark the selected one, and it sits below the fold. Bringing it
 * into view is only possible by moving the page.
 */
export default function Example() {
  return (
    <main style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      {/* Focus has to start outside the composite. Focusing an element that
      already holds DOM focus fires no focus event, and the presentation under
      test hangs off that event. */}
      <button type="button" tabIndex={0}>
        Outside
      </button>
      <Ariakit.CompositeProvider
        virtualFocus
        defaultActiveId={`item-${itemCount}`}
      >
        <Ariakit.Composite
          aria-label="Actions"
          role="listbox"
          tabIndex={0}
          style={{ display: "grid", justifyItems: "start" }}
        >
          {items.map((item) => (
            <Ariakit.CompositeItem
              key={item}
              id={`item-${item}`}
              role="option"
              autoFocus={item === itemCount}
              style={itemStyle}
            >
              Item {item}
            </Ariakit.CompositeItem>
          ))}
        </Ariakit.Composite>
      </Ariakit.CompositeProvider>
    </main>
  );
}
