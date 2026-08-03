import * as Ariakit from "@ariakit/react";
import type { ComponentProps } from "react";
import { useRef } from "react";

type MenuProps = ComponentProps<typeof Ariakit.Menu>;
type UpdatePosition = NonNullable<MenuProps["updatePosition"]>;

// Enough items, at a fixed height, that the last one sits below the fold once
// the menu opens. Bringing it into view is then a page scroll rather than a
// no-op.
const actionCount = 30;

const actions = Array.from(
  { length: actionCount },
  (_, index) => `Action ${index + 1}`,
);

const lastAction = `Action ${actionCount}`;

const measureError = "Could not measure the Actions menu";

/**
 * A menu whose positioning finishes in two steps: it places itself with what it
 * knows, waits for asynchronous work that can change where it belongs, then
 * places itself again. `updatePosition` is the public way to express that, and
 * holding that second step is what keeps a whole positioning pass observable
 * from a test.
 *
 * Everything is driven from buttons outside the menu on purpose. The
 * presentation that `move` schedules only skips its focus-ownership check when
 * focus starts outside the composite, and that is the arrangement where the
 * popup being placed is the only thing left that can release it.
 */
export default function Example() {
  const menu = Ariakit.useMenuStore();
  const holdRef = useRef<Promise<void> | null>(null);
  const releaseRef = useRef<(() => void) | null>(null);
  const failRef = useRef<(() => void) | null>(null);
  const skipRef = useRef(false);

  // Armed before the pass starts, so every run `autoUpdate` makes for that pass
  // waits on the same promise instead of each creating its own and settling on
  // its own.
  const holdNextPass = () => {
    holdRef.current ??= new Promise<void>((resolve, reject) => {
      const settle = () => {
        holdRef.current = null;
        releaseRef.current = null;
        failRef.current = null;
      };
      releaseRef.current = () => {
        settle();
        resolve();
      };
      failRef.current = () => {
        settle();
        reject(new Error(measureError));
      };
    });
  };

  const updatePosition: UpdatePosition = async ({ updatePosition }) => {
    if (!skipRef.current) {
      await updatePosition();
    }
    const held = holdRef.current;
    // Once the supplied default is held back, every later pass fails the same
    // way. Resolving here instead would report a finished pass that positioned
    // nothing, which is not a state a real callback sits in, and the popup
    // would count itself as placed on the next `autoUpdate` run.
    if (!held && skipRef.current) throw new Error(measureError);
    if (!held) return;
    await held;
    await updatePosition();
  };

  return (
    <main style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      {/* Puts the controls below the fold so the page is scrolled while the
      menu is open, which is the only way a page jump is observable. */}
      <div style={{ height: 900 }} />
      <button
        type="button"
        tabIndex={0}
        onClick={() => {
          holdNextPass();
          menu.render();
        }}
      >
        Reposition Actions
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
        Move to last Actions action
      </button>
      <button type="button" tabIndex={0} onClick={() => releaseRef.current?.()}>
        Finish Actions positioning
      </button>
      {/* The asynchronous work a real callback awaits can fail. The pass is
      over either way, and the popup already carries the position the supplied
      default wrote before the failure. */}
      <button type="button" tabIndex={0} onClick={() => failRef.current?.()}>
        Fail Actions positioning
      </button>
      {/* Holds the supplied default back, so the next pass fails without ever
      positioning the popup. That one has nothing to show, so it has to stay
      unplaced. */}
      <button
        type="button"
        tabIndex={0}
        onClick={() => {
          skipRef.current = true;
        }}
      >
        Skip Actions positioning
      </button>
      {/* Last of the controls, so the open menu covers only the spacer below
      instead of the buttons that drive it. */}
      <Ariakit.MenuButton store={menu} tabIndex={0} onClick={holdNextPass}>
        Actions
      </Ariakit.MenuButton>
      {/* hideOnInteractOutside is off so the buttons above can drive the menu
      without closing it. flip and slide are off so the menu keeps a predictable
      geometry: its last item stays below the fold until something scrolls to
      it. */}
      <Ariakit.Menu
        store={menu}
        updatePosition={updatePosition}
        hideOnInteractOutside={false}
        portal={false}
        flip={false}
        slide={false}
        style={{ background: "white", border: "1px solid gray" }}
      >
        {actions.map((action) => (
          <Ariakit.MenuItem
            key={action}
            style={{ display: "block", height: 32 }}
          >
            {action}
          </Ariakit.MenuItem>
        ))}
      </Ariakit.Menu>
      <div style={{ height: 1500 }} />
    </main>
  );
}
