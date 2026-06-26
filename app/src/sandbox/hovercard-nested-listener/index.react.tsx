import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";

// The parent hovercard installs a capture-phase document "mousemove" listener
// to track hover intent. The regression this sandbox guards against tears that
// listener down and reinstalls it every time a nested hovercard mounts or
// unmounts — a synchronous swap with no visible effect. To make it observable,
// this hook counts capture-phase "mousemove" listener installs on the document
// and the example renders the count; toggling the nested hovercard must not
// change it. The count starts at 0 because this hook patches in an effect that
// runs after the hovercard's own effect has installed the initial listener, so
// only later reinstalls are counted.
function useMouseMoveListenerInstalls() {
  const [installs, setInstalls] = useState(0);
  useEffect(() => {
    // Patching addEventListener is the only way to observe listener installs (a
    // real listener could only observe the events). Keep the original itself so
    // the exact method is restored on cleanup.
    // oxlint-disable-next-line unbound-method
    const originalAddEventListener = document.addEventListener;
    document.addEventListener = (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => {
      const capture =
        options === true || (typeof options === "object" && !!options?.capture);
      if (type === "mousemove" && capture) {
        setInstalls((count) => count + 1);
      }
      return originalAddEventListener.call(document, type, listener, options);
    };
    return () => {
      document.addEventListener = originalAddEventListener;
    };
  }, []);
  return installs;
}

function NestedHovercard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen((value) => !value)}>
        Toggle nested
      </button>
      {open && (
        <Ariakit.HovercardProvider open>
          <Ariakit.HovercardAnchor>Nested anchor</Ariakit.HovercardAnchor>
          <Ariakit.Hovercard
            portal
            // The nested card is always open here, so its own hover-intent
            // listeners are unnecessary. Disabling them keeps the install
            // counter measuring only the parent hovercard's listener.
            hideOnHoverOutside={false}
            aria-label="Nested hovercard"
          >
            Nested content
          </Ariakit.Hovercard>
        </Ariakit.HovercardProvider>
      )}
    </>
  );
}

export default function Example() {
  const mouseMoveListenerInstalls = useMouseMoveListenerInstalls();
  return (
    <>
      <p>
        Parent hovercard mousemove listener installs:{" "}
        <output aria-label="Parent hovercard mousemove listener installs">
          {mouseMoveListenerInstalls}
        </output>
      </p>
      <Ariakit.HovercardProvider open>
        <Ariakit.HovercardAnchor>Parent anchor</Ariakit.HovercardAnchor>
        <Ariakit.Hovercard aria-label="Parent hovercard">
          <NestedHovercard />
        </Ariakit.Hovercard>
      </Ariakit.HovercardProvider>
    </>
  );
}
