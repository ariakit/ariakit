import * as Ariakit from "@ariakit/react";
import type { CSSProperties } from "react";
import { useState } from "react";

// The borders show where the dock and the notes are in relation to the
// workspace.
const workspaceStyle = {
  display: "grid",
  justifyItems: "start",
  gap: 8,
  padding: 16,
  border: "1px solid",
} satisfies CSSProperties;

const dockStyle = {
  padding: 8,
  border: "1px dashed",
} satisfies CSSProperties;

// The notes render in the dock of the workspace while they are docked. When
// they undock, the portal element changes to null while the portal stays
// mounted, so the notes move to the default portal node. The dock is an element
// of the app, so it must keep its place in the workspace, and the app must be
// able to remove it later.
export default function Example() {
  const [docked, setDocked] = useState(true);
  const [dockRendered, setDockRendered] = useState(true);
  const [dock, setDock] = useState<HTMLElement | null>(null);
  return (
    <section aria-label="Workspace" style={workspaceStyle}>
      <button onClick={() => setDocked((docked) => !docked)}>
        {docked ? "Undock notes" : "Dock notes"}
      </button>
      <button onClick={() => setDockRendered(false)}>Remove dock</button>
      {dockRendered && (
        <div ref={setDock} role="group" aria-label="Dock" style={dockStyle}>
          <h2>Dock</h2>
        </div>
      )}
      <Ariakit.Portal portalElement={docked ? dock : null}>
        <p>Notes</p>
      </Ariakit.Portal>
    </section>
  );
}
