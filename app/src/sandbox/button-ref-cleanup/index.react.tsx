import * as Ariakit from "@ariakit/react";
import { useMergeRefs } from "@ariakit/react-utils";
import { useCallback, useEffect, useRef, useState } from "react";

function trackDocumentKey(key: string, onKey: () => void) {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== key) return;
    onKey();
  };
  document.addEventListener("keydown", onKeyDown);
  return () => document.removeEventListener("keydown", onKeyDown);
}

export default function Example() {
  const buttonObjectRef = useRef<HTMLButtonElement>(null);
  const plainButtonObjectRef = useRef<HTMLButtonElement>(null);
  const [buttonMounted, setButtonMounted] = useState(true);
  const [plainButtonMounted, setPlainButtonMounted] = useState(true);
  const [portalMounted, setPortalMounted] = useState(true);
  const [connectedPortalMounted, setConnectedPortalMounted] = useState(true);
  const [nonFunctionPortalMounted, setNonFunctionPortalMounted] =
    useState(true);
  const [connectedPortalElement, setConnectedPortalElement] =
    useState<HTMLDivElement | null>(null);
  const [buttonCount, setButtonCount] = useState(0);
  const [portalCount, setPortalCount] = useState(0);
  const [connectedPortalCount, setConnectedPortalCount] = useState(0);
  const [externalButtonDetached, setExternalButtonDetached] = useState(false);
  const [buttonObjectAttached, setButtonObjectAttached] = useState(false);
  const [buttonObjectDetached, setButtonObjectDetached] = useState(false);
  const [plainButtonDetached, setPlainButtonDetached] = useState(false);
  const [plainButtonObjectAttached, setPlainButtonObjectAttached] =
    useState(false);
  const [plainButtonObjectDetached, setPlainButtonObjectDetached] =
    useState(false);
  const [nonFunctionPortalDetached, setNonFunctionPortalDetached] =
    useState(false);

  useEffect(() => {
    if (buttonMounted) {
      setButtonObjectAttached(
        buttonObjectRef.current?.textContent === "Observed button",
      );
    } else {
      setButtonObjectDetached(buttonObjectRef.current === null);
    }

    if (plainButtonMounted) {
      setPlainButtonObjectAttached(
        plainButtonObjectRef.current?.textContent === "Plain button",
      );
    } else {
      setPlainButtonObjectDetached(plainButtonObjectRef.current === null);
    }
  }, [buttonMounted, plainButtonMounted]);

  const observedButtonRef = useCallback((element: HTMLButtonElement | null) => {
    if (!element) return;
    return trackDocumentKey("b", () => setButtonCount((count) => count + 1));
  }, []);

  const externalButtonRef = useCallback((element: HTMLButtonElement | null) => {
    if (element) return;
    setExternalButtonDetached(true);
  }, []);

  const buttonRef = useMergeRefs(externalButtonRef, buttonObjectRef);

  const plainButtonCallbackRef = useCallback(
    (element: HTMLButtonElement | null) => {
      if (element) return;
      setPlainButtonDetached(true);
    },
    [],
  );

  const plainButtonRef = useMergeRefs(
    plainButtonCallbackRef,
    plainButtonObjectRef,
  );

  const portalRef = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    return trackDocumentKey("p", () => setPortalCount((count) => count + 1));
  }, []);

  const connectedPortalRef = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    return trackDocumentKey("c", () =>
      setConnectedPortalCount((count) => count + 1),
    );
  }, []);

  const nonFunctionPortalRef = useCallback((element: HTMLElement | null) => {
    if (!element) {
      setNonFunctionPortalDetached(true);
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
      <p>Button shortcut count: {buttonCount}</p>
      <p>Portal shortcut count: {portalCount}</p>
      <p>Connected portal shortcut count: {connectedPortalCount}</p>
      <p>External button detached: {externalButtonDetached ? "yes" : "no"}</p>
      <p>Button object ref attached: {buttonObjectAttached ? "yes" : "no"}</p>
      <p>Button object ref detached: {buttonObjectDetached ? "yes" : "no"}</p>
      <p>Plain button detached: {plainButtonDetached ? "yes" : "no"}</p>
      <p>
        Plain button object ref attached:{" "}
        {plainButtonObjectAttached ? "yes" : "no"}
      </p>
      <p>
        Plain button object ref detached:{" "}
        {plainButtonObjectDetached ? "yes" : "no"}
      </p>
      <p>
        Non-function portal detached: {nonFunctionPortalDetached ? "yes" : "no"}
      </p>
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
      <div id="connected-portal-root" ref={setConnectedPortalElement}>
        Connected portal root
      </div>
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
