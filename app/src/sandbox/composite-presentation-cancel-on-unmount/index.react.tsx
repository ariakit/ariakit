import * as Ariakit from "@ariakit/react";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";

/**
 * A shortcuts panel whose store is created by this page, so it outlives every
 * mount of the panel itself.
 *
 * Focusing a virtual focus composite schedules a presentation for its active
 * item in a microtask, so the panel can be dismissed before that microtask
 * runs. The controls below dismiss it at each of the moments an app
 * realistically would: in a later task, in the same handler that focused it,
 * synchronously with `flushSync`, which apps reach for when they need the
 * collapsed layout before the task ends, and from the panel's own focus
 * handler, which runs before the composite queues anything at all.
 *
 * The recent files entry is loaded on demand, which registers a composite item
 * long after the panel was dismissed. The panel scrolls and that entry is
 * marked as a presentation target, so presenting it is observable too.
 */
export default function Example() {
  const store = Ariakit.useCompositeStore({
    virtualFocus: true,
    defaultActiveId: "recent",
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [dismissOnFocus, setDismissOnFocus] = useState(false);

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button type="button" tabIndex={0} onClick={() => setOpen(true)}>
          Show shortcuts
        </button>
        <button type="button" tabIndex={0} onClick={() => setOpen(false)}>
          Hide shortcuts
        </button>
        <button
          type="button"
          tabIndex={0}
          onClick={() => {
            panelRef.current?.focus();
            setOpen(false);
          }}
        >
          Focus and hide shortcuts
        </button>
        <button
          type="button"
          tabIndex={0}
          onClick={() => {
            panelRef.current?.focus();
            flushSync(() => setOpen(false));
          }}
        >
          Focus and hide shortcuts synchronously
        </button>
        <button type="button" tabIndex={0} onClick={() => setLoaded(true)}>
          Load recent files
        </button>
        <button type="button" tabIndex={0} onClick={() => store.move("recent")}>
          Highlight recent files
        </button>
        <button
          type="button"
          tabIndex={0}
          onClick={() => {
            setDismissOnFocus(true);
            setOpen(true);
          }}
        >
          Hide shortcuts on focus
        </button>
      </div>
      {open && (
        <Ariakit.Composite
          store={store}
          ref={panelRef}
          role="toolbar"
          aria-label="Shortcuts"
          tabIndex={0}
          style={{ height: 60, overflow: "auto" }}
          onFocus={() => {
            if (!dismissOnFocus) return;
            setDismissOnFocus(false);
            flushSync(() => setOpen(false));
          }}
        >
          <button type="button" tabIndex={0}>
            Edit shortcuts
          </button>
          <div style={{ height: 200 }} />
          {loaded && (
            <Ariakit.CompositeItem data-autofocus id="recent">
              Recent files
            </Ariakit.CompositeItem>
          )}
        </Ariakit.Composite>
      )}
    </>
  );
}
