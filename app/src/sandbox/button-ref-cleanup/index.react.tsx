import * as Ariakit from "@ariakit/react";
import { useMergeRefs } from "@ariakit/react-utils";
import { useCallback, useState } from "react";

const listenerEvents: string[] = [];
const activeListeners = new Set<string>();
const buttonObjectRef = { current: null as HTMLButtonElement | null };
const plainButtonObjectRef = { current: null as HTMLButtonElement | null };
let observedButton: HTMLButtonElement | null = null;
let observedPortal: HTMLElement | null = null;
let observedConnectedPortal: HTMLElement | null = null;

function trackClickListener(element: HTMLElement, name: string) {
  const onClick = () => listenerEvents.push(`${name} click`);
  element.addEventListener("click", onClick);
  activeListeners.add(name);
  return (onCleanup?: () => void) => {
    element.removeEventListener("click", onClick);
    activeListeners.delete(name);
    onCleanup?.();
    listenerEvents.push(`${name} cleanup`);
  };
}

function resetListenerEvents() {
  listenerEvents.length = 0;
}

function getActiveListeners() {
  return [...activeListeners].sort();
}

interface RefCleanupTestState {
  buttonObjectRef: typeof buttonObjectRef;
  clickObservedButton: () => void;
  clickObservedConnectedPortal: () => void;
  clickObservedPortal: () => void;
  getActiveListeners: () => string[];
  listenerEvents: string[];
  plainButtonObjectRef: typeof plainButtonObjectRef;
  resetListenerEvents: () => void;
}

declare global {
  interface Window {
    __refCleanupTest?: RefCleanupTestState;
  }
}

if (typeof window !== "undefined") {
  window.__refCleanupTest = {
    buttonObjectRef,
    clickObservedButton: () => observedButton?.click(),
    clickObservedConnectedPortal: () => observedConnectedPortal?.click(),
    clickObservedPortal: () => observedPortal?.click(),
    getActiveListeners,
    listenerEvents,
    plainButtonObjectRef,
    resetListenerEvents,
  };
}

export default function Example() {
  const [buttonMounted, setButtonMounted] = useState(true);
  const [plainButtonMounted, setPlainButtonMounted] = useState(true);
  const [portalMounted, setPortalMounted] = useState(true);
  const [connectedPortalMounted, setConnectedPortalMounted] = useState(true);
  const [nonFunctionPortalMounted, setNonFunctionPortalMounted] =
    useState(true);
  const [connectedPortalElement, setConnectedPortalElement] =
    useState<HTMLDivElement | null>(null);

  const observedButtonRef = useCallback((element: HTMLButtonElement | null) => {
    if (!element) return;
    observedButton = element;
    const cleanup = trackClickListener(element, "button");
    return () => cleanup(() => (observedButton = null));
  }, []);

  const externalButtonRef = useCallback((element: HTMLButtonElement | null) => {
    if (element) return;
    listenerEvents.push("external button detach");
  }, []);

  const buttonRef = useMergeRefs(externalButtonRef, buttonObjectRef);

  const plainButtonCallbackRef = useCallback(
    (element: HTMLButtonElement | null) => {
      if (element) return;
      listenerEvents.push("plain button detach");
    },
    [],
  );

  const plainButtonRef = useMergeRefs(
    plainButtonCallbackRef,
    plainButtonObjectRef,
  );

  const portalRef = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    observedPortal = element;
    const cleanup = trackClickListener(element, "portal");
    return () => cleanup(() => (observedPortal = null));
  }, []);

  const connectedPortalRef = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    observedConnectedPortal = element;
    const cleanup = trackClickListener(element, "connected portal");
    return () => cleanup(() => (observedConnectedPortal = null));
  }, []);

  const nonFunctionPortalRef = useCallback((element: HTMLElement | null) => {
    if (!element) {
      listenerEvents.push("non-function portal detach");
    }
    return element;
  }, []);

  return (
    <>
      <button type="button" onClick={() => setButtonMounted(false)}>
        Unmount button
      </button>
      <button type="button" onClick={() => setPlainButtonMounted(false)}>
        Unmount plain button
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
          render={<button ref={observedButtonRef} type="button" />}
        >
          Observed button
        </Ariakit.Button>
      )}
      {plainButtonMounted && (
        <Ariakit.Button ref={plainButtonRef}>Plain button</Ariakit.Button>
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
