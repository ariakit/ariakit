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
/**
 * A composite that can't take focus at all. `move(null)` still targets the
 * composite element, but focusing it is a no-op, so nothing about the request
 * justifies moving the page to it.
 *
 * The trigger is rendered above the fold on purpose: a button that has to be
 * scrolled to before it can be clicked would put the harness's own scroll into
 * the measurement.
 */
function UnfocusableComposite() {
  const store = Ariakit.useCompositeStore();
  return (
    <Ariakit.CompositeProvider store={store}>
      <button type="button" tabIndex={0} onClick={() => store.move(null)}>
        Move to unfocusable composite
      </button>
      {/* Puts the composite out of view while the trigger stays clickable
      without the harness scrolling to reach it. */}
      <div style={{ height: 900 }} />
      <Ariakit.Composite
        focusable={false}
        aria-label="Unfocusable actions"
        role="listbox"
        style={{ display: "grid", justifyItems: "start" }}
      >
        {items.slice(0, 3).map((item) => (
          <Ariakit.CompositeItem
            key={item}
            id={`unfocusable-item-${item}`}
            role="option"
            style={itemStyle}
          >
            Unfocusable item {item}
          </Ariakit.CompositeItem>
        ))}
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

export default function Example() {
  return (
    <main style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      {/* Focus has to start outside the composite. Focusing an element that
      already holds DOM focus fires no focus event, and the presentation under
      test hangs off that event. */}
      <button type="button" tabIndex={0}>
        Outside
      </button>
      <UnfocusableComposite />
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
