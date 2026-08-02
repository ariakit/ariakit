import * as Ariakit from "@ariakit/react";
import { useRef } from "react";

const actions = [
  "Save",
  "Save as",
  "Open",
  "Open recent",
  "Import",
  "Export",
  "Print",
  "Share",
  "Duplicate",
  "Rename",
];

const lastAction = "Rename";

/**
 * A menu that stays in its positioning window for as long as the test needs.
 *
 * The `updatePosition` prop is awaited before the popover marks itself
 * positioned, so returning a promise that only settles on demand holds the
 * popup at its pre-placement origin. That's the window in which a presentation
 * request parks, which is the state this fixture exists to reach. The release
 * button is a manual escape hatch for opening this sandbox in a browser; the
 * test never needs it, because hiding the menu clears the placing state on its
 * own.
 *
 * Everything is driven from buttons outside the menu on purpose. The
 * presentation that `move` schedules only skips its focus-ownership check when
 * focus starts outside the composite, and that is the arrangement where the
 * popup closing is the only thing left that can abandon it.
 */
export default function Example() {
  const menu = Ariakit.useMenuStore();
  const releaseRef = useRef<(() => void) | null>(null);

  const updatePosition = () =>
    new Promise<void>((resolve) => {
      releaseRef.current = resolve;
    });

  return (
    <main style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      {/* Puts the controls below the fold so the page is scrolled while the
      menu opens, which is the only way a page jump is observable. */}
      <div style={{ height: 900 }} />
      <button type="button" tabIndex={0} onClick={menu.show}>
        Show menu
      </button>
      <button
        type="button"
        tabIndex={0}
        onClick={() => {
          const item = menu
            .getState()
            .items.find((item) => item.element?.textContent === lastAction);
          if (item) {
            menu.move(item.id);
          }
        }}
      >
        Move to last action
      </button>
      <button type="button" tabIndex={0} onClick={menu.hide}>
        Hide menu
      </button>
      <button
        type="button"
        tabIndex={0}
        onClick={() => {
          releaseRef.current?.();
          releaseRef.current = null;
        }}
      >
        Finish positioning
      </button>
      {/* hideOnInteractOutside is off so the buttons above can drive the menu
      without closing it. */}
      <Ariakit.Menu
        store={menu}
        aria-label="Actions"
        updatePosition={updatePosition}
        hideOnInteractOutside={false}
        portal={false}
        style={{ background: "white", border: "1px solid gray" }}
      >
        {actions.map((action) => (
          <Ariakit.MenuItem key={action} style={{ display: "block" }}>
            {action}
          </Ariakit.MenuItem>
        ))}
      </Ariakit.Menu>
      <div style={{ height: 900 }} />
    </main>
  );
}
