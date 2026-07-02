import * as Ariakit from "@ariakit/react";
import { StrictMode, useEffect, useRef, useState } from "react";

const tooltipId = "tooltip-repro";
const portalSelector = `[id="portal/${tooltipId}"]`;

function getPortalCount() {
  return document.querySelectorAll(portalSelector).length;
}

function usePortalCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(getPortalCount());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return count;
}

function Repro() {
  const fullscreenHostRef = useRef<HTMLDivElement>(null);
  const [fullscreenHostMounted, setFullscreenHostMounted] = useState(true);
  const [mounted, setMounted] = useState(true);
  const [open, setOpen] = useState(false);
  const [pinnedOpen, setPinnedOpen] = useState(false);
  const portalCount = usePortalCount();
  const tooltipOpen = open || pinnedOpen;

  const enterFullscreen = () => {
    void fullscreenHostRef.current?.requestFullscreen();
  };

  const exitFullscreen = () => {
    if (!document.fullscreenElement) return;
    void document.exitFullscreen();
  };

  return (
    <section
      aria-label="Portal leak repro"
      style={{
        alignItems: "flex-start",
        background: "white",
        color: "black",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        minHeight: 240,
        padding: 24,
      }}
    >
      {fullscreenHostMounted && (
        <div
          ref={fullscreenHostRef}
          style={{
            alignItems: "flex-start",
            background: "white",
            color: "black",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 24,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="button" onClick={enterFullscreen}>
              Enter fullscreen
            </button>
            <button type="button" onClick={exitFullscreen}>
              Exit fullscreen
            </button>
            <button type="button" onClick={() => setPinnedOpen(true)}>
              Pin tooltip
            </button>
            <button type="button" onClick={() => setMounted(false)}>
              Unmount tooltip
            </button>
            <button type="button" onClick={() => setMounted(true)}>
              Mount tooltip
            </button>
            <button
              type="button"
              onClick={() => setFullscreenHostMounted(false)}
            >
              Unmount fullscreen host
            </button>
          </div>
          <div role="status" aria-label="Portal containers">
            Portal containers: {portalCount}
          </div>
        </div>
      )}
      {mounted && (
        <Ariakit.TooltipProvider
          open={tooltipOpen}
          setOpen={setOpen}
          timeout={0}
        >
          <Ariakit.TooltipAnchor render={<button type="button" />}>
            Hover target
          </Ariakit.TooltipAnchor>
          <Ariakit.Tooltip id={tooltipId} unmountOnHide>
            Tooltip content
          </Ariakit.Tooltip>
        </Ariakit.TooltipProvider>
      )}
    </section>
  );
}

export default function Example() {
  return (
    <StrictMode>
      <Repro />
    </StrictMode>
  );
}
