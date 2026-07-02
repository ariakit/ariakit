import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";

export default function Example() {
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [inlinePortalEnabled, setInlinePortalEnabled] = useState(true);
  const [cleanupConnected, setCleanupConnected] = useState(false);
  const [inlineAttachConnected, setInlineAttachConnected] = useState(false);

  const portalRef = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    return () => {
      setCleanupConnected(element.isConnected);
    };
  }, []);

  return (
    <>
      <button type="button" onClick={() => setPortalEnabled(false)}>
        Disable portal
      </button>
      <button type="button" onClick={() => setInlinePortalEnabled(false)}>
        Disable inline portal
      </button>
      <p>Portal cleanup connected: {cleanupConnected ? "yes" : "no"}</p>
      <p>
        Inline portal attach connected: {inlineAttachConnected ? "yes" : "no"}
      </p>
      {/* Toggling the portal prop off removes the portal node while the
          component stays mounted, so the portalRef cleanup must still observe
          a connected node. */}
      <Ariakit.Portal portal={portalEnabled} portalRef={portalRef}>
        <div>Portal content</div>
      </Ariakit.Portal>
      {/* The inline portalRef changes identity on the same render that
          toggles the portal off, so the new ref must not be attached to the
          removed portal node. */}
      <Ariakit.Portal
        portal={inlinePortalEnabled}
        portalRef={(element) => {
          if (!element) return;
          setInlineAttachConnected(element.isConnected);
        }}
      >
        <div>Inline portal content</div>
      </Ariakit.Portal>
    </>
  );
}
