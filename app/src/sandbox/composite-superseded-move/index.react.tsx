import * as Ariakit from "@ariakit/react";
import { useState } from "react";

/**
 * A tool palette that can take focus itself, with the store created by the page
 * so it outlives every mount of the palette.
 *
 * Asking for a tool that has not loaded records a move nothing can carry out
 * yet. Clicking the palette itself then focuses the palette rather than a tool,
 * which replaces that pending request with the palette's own. The request is
 * spent from there on, so nothing should carry it out later.
 *
 * Handing off composite behavior renders the same palette with
 * `composite={false}`, the way a widget does when another composite takes over
 * focus and keyboard navigation for it. Taking it back mounts a fresh effect,
 * which is what a replayed request would come back through.
 */
export default function Example() {
  const store = Ariakit.useCompositeStore();
  const [handedOff, setHandedOff] = useState(false);
  const [zoomLoaded, setZoomLoaded] = useState(false);

  return (
    <main style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button type="button" tabIndex={0} onClick={() => store.move("zoom")}>
          Focus zoom tool
        </button>
        <button type="button" tabIndex={0} onClick={() => setZoomLoaded(true)}>
          Load zoom tool
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
      {/* Padded, so there is palette to click that is not a tool. `tabIndex`
      keeps the palette itself focusable while a tool is active, which is what
      lets it take a pending request over. */}
      <Ariakit.Composite
        store={store}
        composite={!handedOff}
        role="listbox"
        aria-label="Tools"
        tabIndex={0}
        style={{ display: "grid", gap: 8, padding: 16, minWidth: 160 }}
      >
        <Ariakit.CompositeItem id="pen" role="option">
          Pen
        </Ariakit.CompositeItem>
        {zoomLoaded && (
          <Ariakit.CompositeItem id="zoom" role="option">
            Zoom
          </Ariakit.CompositeItem>
        )}
      </Ariakit.Composite>
    </main>
  );
}
