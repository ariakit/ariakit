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

interface HeldMenuProps {
  label: string;
  /**
   * Keeps the popup mounted through an exit transition after it closes, which
   * is the window in which `mounted` alone cannot tell that it is going away.
   */
  animated?: boolean;
}

/**
 * A menu that stays in its positioning window for as long as the test needs.
 *
 * The `updatePosition` prop is awaited before the popover marks itself
 * positioned, so returning a promise that only settles on demand holds the
 * popup at its pre-placement origin. That's the window in which a presentation
 * request parks, which is the state this fixture exists to reach.
 *
 * Everything is driven from buttons outside the menu on purpose. The
 * presentation that `move` schedules only skips its focus-ownership check when
 * focus starts outside the composite, and that is the arrangement where the
 * popup going away is the only thing left that can abandon it.
 */
function HeldMenu({ label, animated }: HeldMenuProps) {
  // Long enough that the exit transition cannot end while the test is still
  // driving it, so "still mounted while closing" stays a state rather than a
  // race the guard could stop being measured by.
  const menu = Ariakit.useMenuStore({
    animated: animated ? 10_000 : undefined,
  });
  const releaseRef = useRef<(() => void) | null>(null);

  const updatePosition = () =>
    new Promise<void>((resolve) => {
      releaseRef.current = resolve;
    });

  return (
    <>
      <button type="button" tabIndex={0} onClick={menu.show}>
        Show {label}
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
        Move to last {label} action
      </button>
      <button type="button" tabIndex={0} onClick={menu.hide}>
        Hide {label}
      </button>
      <button
        type="button"
        tabIndex={0}
        onClick={() => {
          releaseRef.current?.();
          releaseRef.current = null;
        }}
      >
        Finish {label} positioning
      </button>
      {/* hideOnInteractOutside is off so the buttons above can drive the menu
      without closing it. */}
      <Ariakit.Menu
        store={menu}
        aria-label={label}
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
    </>
  );
}

export default function Example() {
  return (
    <main style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      {/* Puts the controls below the fold so the page is scrolled while the
      menus open, which is the only way a page jump is observable. */}
      <div style={{ height: 900 }} />
      <HeldMenu label="Actions" />
      <HeldMenu label="Animated actions" animated />
      <div style={{ height: 900 }} />
    </main>
  );
}
