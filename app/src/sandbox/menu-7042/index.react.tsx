import * as Ariakit from "@ariakit/react";
import { Fragment, useEffect, useRef, useState } from "react";

const actions = [
  "New",
  "Open",
  "Open recent",
  "Save",
  "Save as",
  "Export",
  "Import",
  "Print",
  "Share",
  "Duplicate",
  "Move",
  "Copy",
  "Archive",
  "Delete",
  "Properties",
  "Settings",
  "Help",
  "Feedback",
  "About",
  "Rename",
];

interface MenuVariantProps {
  label: string;
  replaceItems?: boolean;
  workaround?: boolean;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Holds menu positioning open while a focused item is replaced. The
 * replacement keeps the item's id, so it remains the same logical item.
 */
function MenuVariant({
  label,
  replaceItems = false,
  workaround = false,
}: MenuVariantProps) {
  const menu = Ariakit.useMenuStore();
  const releaseRef = useRef<(() => void) | null>(null);
  const [generation, setGeneration] = useState(0);

  const updatePosition = () =>
    new Promise<void>((resolve) => {
      releaseRef.current = resolve;
    });

  // TODO: Remove once https://github.com/ariakit/ariakit/issues/7042 is fixed.
  useEffect(() => {
    if (!replaceItems || !workaround) return;
    const { activeId, open } = menu.getState();
    if (!open || activeId == null) return;
    menu.move(activeId);
  }, [generation, menu, replaceItems, workaround]);

  return (
    <section style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      <h2>{label}</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" tabIndex={0} onClick={menu.show}>
          Show {label}
        </button>
        {replaceItems && (
          <button
            type="button"
            tabIndex={0}
            onClick={() => setGeneration((value) => value + 1)}
          >
            Replace {label} items
          </button>
        )}
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
      </div>
      <Ariakit.Menu
        store={menu}
        aria-label={label}
        hideOnInteractOutside={false}
        portal={false}
        updatePosition={updatePosition}
        style={{
          background: "white",
          border: "1px solid gray",
          height: 100,
          overflow: "auto",
        }}
      >
        <Fragment key={replaceItems ? generation : undefined}>
          {actions.map((action) => (
            <Ariakit.MenuItem
              key={action}
              id={`${slugify(label)}-${slugify(action)}`}
              style={{ display: "block", padding: "4px 8px" }}
            >
              {action}
            </Ariakit.MenuItem>
          ))}
        </Fragment>
      </Ariakit.Menu>
    </section>
  );
}

export default function Example() {
  return (
    <main style={{ display: "grid", gap: 32 }}>
      <MenuVariant label="Stable actions" />
      <MenuVariant label="Replaced actions" replaceItems workaround />
    </main>
  );
}
