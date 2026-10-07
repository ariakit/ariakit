import * as Ariakit from "@ariakit/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const menuStyle = { background: "white", border: "1px solid gray" };
const itemStyle = { display: "block" };

interface ShadowHostProps {
  children: ReactNode;
}

// Renders its children inside an open shadow root, the way a web component that
// hosts a React app does.
function ShadowHost({ children }: ShadowHostProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    setRoot(host.shadowRoot || host.attachShadow({ mode: "open" }));
  }, []);
  return <div ref={hostRef}>{root && createPortal(children, root)}</div>;
}

interface EditMenuProps {
  label: string;
  /**
   * Keeps DOM focus on the menu element while the user moves through the items.
   */
  virtualFocus?: boolean;
  /**
   * Adds a Paste special submenu whose action also creates history. The submenu
   * renders in a portal, which is outside the shadow root.
   */
  portalSubmenu?: boolean;
}

/**
 * An Edit menu whose first action depends on the history. Pasting creates
 * history, so Undo becomes the first action while the menu is open.
 */
function EditMenu({ label, virtualFocus, portalSubmenu }: EditMenuProps) {
  const [canUndo, setCanUndo] = useState(false);

  return (
    <Ariakit.MenuProvider virtualFocus={virtualFocus}>
      <Ariakit.MenuButton>{label}</Ariakit.MenuButton>
      <Ariakit.Menu style={menuStyle}>
        {canUndo && <Ariakit.MenuItem style={itemStyle}>Undo</Ariakit.MenuItem>}
        <Ariakit.MenuItem style={itemStyle}>Cut</Ariakit.MenuItem>
        <Ariakit.MenuItem style={itemStyle}>Copy</Ariakit.MenuItem>
        <Ariakit.MenuItem
          hideOnClick={false}
          style={itemStyle}
          onClick={() => setCanUndo(true)}
        >
          Paste
        </Ariakit.MenuItem>
        {portalSubmenu && (
          <Ariakit.MenuProvider>
            <Ariakit.MenuButton render={<Ariakit.MenuItem style={itemStyle} />}>
              Paste special
            </Ariakit.MenuButton>
            <Ariakit.Menu portal style={menuStyle}>
              <Ariakit.MenuItem
                hideOnClick={false}
                style={itemStyle}
                onClick={() => setCanUndo(true)}
              >
                Paste as text
              </Ariakit.MenuItem>
            </Ariakit.Menu>
          </Ariakit.MenuProvider>
        )}
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

export default function Example() {
  return (
    <ShadowHost>
      <main style={{ display: "flex", gap: 8 }}>
        <EditMenu label="Edit" />
        <EditMenu label="Edit with virtual focus" virtualFocus />
        <EditMenu label="Edit with portal submenu" portalSubmenu />
      </main>
    </ShadowHost>
  );
}
