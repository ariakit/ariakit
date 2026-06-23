import * as Ariakit from "@ariakit/react";
import { queueBeforeEvent } from "@ariakit/utils";
import { useRef, useState } from "react";

export default function Example() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cancelAutoHideRef = useRef<(() => void) | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [status, setStatus] = useState("hidden");

  const showShortcuts = () => {
    const container = containerRef.current;
    if (!container) return;

    setHintVisible(true);
    setStatus("visible");
    let canceled = false;
    const cancelAutoHide = queueBeforeEvent(
      container,
      "mousedown",
      () => {
        if (canceled) return;
        cancelAutoHideRef.current = null;
        setHintVisible(false);
        setStatus("auto-hidden");
      },
      30_000,
    );
    cancelAutoHideRef.current = () => {
      canceled = true;
      cancelAutoHide();
    };
  };

  const pinHint = () => {
    const cancelAutoHide = cancelAutoHideRef.current;
    if (!cancelAutoHide) return;

    cancelAutoHideRef.current = null;
    cancelAutoHide();
    setStatus("pinned");
  };

  return (
    <div ref={containerRef}>
      <Ariakit.Button onClick={showShortcuts}>Show shortcuts</Ariakit.Button>
      <Ariakit.Button>New document</Ariakit.Button>
      {hintVisible && (
        <section aria-label="Keyboard shortcuts" onMouseEnter={pinHint}>
          <p>
            Press <kbd>Ctrl</kbd>+<kbd>N</kbd> to create a new document.
          </p>
        </section>
      )}
      <output>Status: {status}</output>
    </div>
  );
}
