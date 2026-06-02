import * as Ariakit from "@ariakit/react";
import { useMergeRefs } from "@ariakit/react-utils";
import { useCallback, useState } from "react";

const refEvents: string[] = [];
const portalRefEvents: string[] = [];
const connectedPortalRefEvents: string[] = [];
const nonFunctionPortalRefEvents: string[] = [];
const buttonObjectRef = { current: null as HTMLButtonElement | null };

function resetRefEvents() {
  refEvents.length = 0;
  portalRefEvents.length = 0;
  connectedPortalRefEvents.length = 0;
  nonFunctionPortalRefEvents.length = 0;
}

interface RefCleanupTestState {
  buttonObjectRef: typeof buttonObjectRef;
  connectedPortalRefEvents: string[];
  nonFunctionPortalRefEvents: string[];
  portalRefEvents: string[];
  refEvents: string[];
  resetRefEvents: () => void;
}

declare global {
  interface Window {
    __refCleanupTest?: RefCleanupTestState;
  }
}

if (typeof window !== "undefined") {
  window.__refCleanupTest = {
    buttonObjectRef,
    connectedPortalRefEvents,
    nonFunctionPortalRefEvents,
    portalRefEvents,
    refEvents,
    resetRefEvents,
  };
}

export default function Example() {
  const [buttonMounted, setButtonMounted] = useState(true);
  const [portalMounted, setPortalMounted] = useState(true);
  const [connectedPortalMounted, setConnectedPortalMounted] = useState(true);
  const [nonFunctionPortalMounted, setNonFunctionPortalMounted] =
    useState(true);
  const [connectedPortalElement, setConnectedPortalElement] =
    useState<HTMLDivElement | null>(null);

  const cleanupRef = useCallback((element: HTMLButtonElement | null) => {
    refEvents.push(element ? "cleanup attach" : "cleanup detach");
    if (!element) return;
    return () => {
      refEvents.push("cleanup");
    };
  }, []);

  const plainRef = useCallback((element: HTMLButtonElement | null) => {
    refEvents.push(element ? "plain attach" : "plain detach");
  }, []);

  const buttonRef = useMergeRefs(plainRef, buttonObjectRef);

  const portalRef = useCallback((element: HTMLElement | null) => {
    portalRefEvents.push(element ? "portal attach" : "portal detach");
    if (!element) return;
    return () => {
      portalRefEvents.push("portal cleanup");
    };
  }, []);

  const connectedPortalRef = useCallback((element: HTMLElement | null) => {
    connectedPortalRefEvents.push(
      element ? "connected portal attach" : "connected portal detach",
    );
    if (!element) return;
    return () => {
      connectedPortalRefEvents.push("connected portal cleanup");
    };
  }, []);

  const nonFunctionPortalRef = useCallback((element: HTMLElement | null) => {
    nonFunctionPortalRefEvents.push(
      element ? "non-function portal attach" : "non-function portal detach",
    );
    return element;
  }, []);

  return (
    <>
      <button type="button" onClick={() => setButtonMounted(false)}>
        Unmount button
      </button>
      <button type="button" onClick={() => setPortalMounted(false)}>
        Unmount portal
      </button>
      <button type="button" onClick={() => setConnectedPortalMounted(false)}>
        Unmount connected portal
      </button>
      <button type="button" onClick={() => setNonFunctionPortalMounted(false)}>
        Unmount non-function portal
      </button>
      {buttonMounted && (
        <Ariakit.Button
          ref={buttonRef}
          render={<button ref={cleanupRef} type="button" />}
        >
          Rendered button
        </Ariakit.Button>
      )}
      {portalMounted && (
        <Ariakit.Portal portalRef={portalRef}>
          <div>Portal content</div>
        </Ariakit.Portal>
      )}
      <div id="connected-portal-root" ref={setConnectedPortalElement} />
      {connectedPortalMounted && connectedPortalElement && (
        <Ariakit.Portal
          portalElement={connectedPortalElement}
          portalRef={connectedPortalRef}
        >
          <div>Connected portal content</div>
        </Ariakit.Portal>
      )}
      {nonFunctionPortalMounted && (
        // @ts-expect-error Deliberately exercises a JS callback ref that
        // returns a non-function value so Portal falls back to null detach.
        <Ariakit.Portal portalRef={nonFunctionPortalRef}>
          <div>Non-function portal content</div>
        </Ariakit.Portal>
      )}
    </>
  );
}
