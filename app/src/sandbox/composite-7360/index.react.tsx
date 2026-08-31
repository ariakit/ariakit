import * as Ariakit from "@ariakit/react";
import { useState } from "react";

// Taller than a viewport, so the toolbar after it starts out of view from the
// controls above.
const paragraphs = Array.from({ length: 24 }, (_, index) => index + 1);

/**
 * A formatting toolbar at the end of a long document, with the store created by
 * the page so it outlives every mount of the toolbar itself.
 *
 * Collapsing the toolbar points the store's active item back at the toolbar
 * container. That is what an app does for a widget that should come back with
 * no item of its own selected, and `setActiveId(null)` only records it. Unlike
 * the `move(null)` behind the focus command, it asks for no focus.
 *
 * Handing off composite behavior renders the same toolbar with
 * `composite={false}`, the way a widget does when another composite takes over
 * focus and keyboard navigation for it. The toolbar stops moving focus
 * meanwhile, so a focus command issued while it is handed off has to wait until
 * the toolbar is a composite again.
 */
export default function Example() {
  const store = Ariakit.useCompositeStore();
  const [expanded, setExpanded] = useState(true);
  const [handedOff, setHandedOff] = useState(false);

  return (
    <main style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button
          type="button"
          tabIndex={0}
          onClick={() => {
            if (expanded) {
              store.setActiveId(null);
            }
            setExpanded(!expanded);
          }}
        >
          {expanded ? "Collapse toolbar" : "Expand toolbar"}
        </button>
        <button type="button" tabIndex={0} onClick={() => store.move(null)}>
          Focus toolbar
        </button>
        <label>
          <input
            type="checkbox"
            tabIndex={0}
            checked={handedOff}
            onChange={(event) => setHandedOff(event.currentTarget.checked)}
          />
          Hand off composite behavior
        </label>
      </div>
      {paragraphs.map((paragraph) => (
        <p key={paragraph} style={{ height: 80 }}>
          Paragraph {paragraph}
        </p>
      ))}
      {/* Last on the page, so removing and adding it changes layout only below
      the controls. Scroll anchoring then has nothing to compensate for, which
      leaves the composite itself as the only thing that can move the page. */}
      {expanded && (
        <Ariakit.Composite
          store={store}
          composite={!handedOff}
          role="toolbar"
          aria-label="Formatting"
          style={{ display: "flex", gap: 8 }}
        >
          <Ariakit.CompositeItem id="bold">Bold</Ariakit.CompositeItem>
          <Ariakit.CompositeItem id="italic">Italic</Ariakit.CompositeItem>
          <Ariakit.CompositeItem id="underline">
            Underline
          </Ariakit.CompositeItem>
        </Ariakit.Composite>
      )}
    </main>
  );
}
