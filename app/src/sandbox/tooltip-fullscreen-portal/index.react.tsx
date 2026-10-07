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

// TODO: Remove this workaround when the fix for the issue below is released.
// While the page itself is the fullscreen element, Portal appends the default
// portal nodes to <html>. This moves them back to <body>.
// https://github.com/ariakit/ariakit/issues/7763
function useKeepPortalsInBody() {
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      if (document.fullscreenElement !== root) return;
      for (const node of Array.from(root.children)) {
        if (node === document.head) continue;
        if (node === document.body) continue;
        document.body.appendChild(node);
      }
    });
    observer.observe(root, { childList: true });
    return () => observer.disconnect();
  }, []);
}

// The player is inside the default portal node of the modal dialog. When the
// player enters fullscreen, the fullscreen element is a descendant of that
// portal node, so the portal node can't move into it.
// https://github.com/ariakit/ariakit/issues/7758
function VideoDialog() {
  const playerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const enterFullscreen = () => {
    void playerRef.current?.requestFullscreen();
  };

  const exitFullscreen = () => {
    if (!document.fullscreenElement) return;
    void document.exitFullscreen();
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open video
      </button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        style={{
          alignItems: "flex-start",
          background: "white",
          border: "1px solid",
          color: "black",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          inset: 48,
          padding: 24,
          position: "fixed",
          zIndex: 50,
        }}
      >
        <Ariakit.DialogHeading>Video</Ariakit.DialogHeading>
        <div
          ref={playerRef}
          role="group"
          aria-label="Player"
          style={{
            background: "white",
            color: "black",
            display: "flex",
            gap: 8,
            padding: 24,
          }}
        >
          <button type="button" onClick={enterFullscreen}>
            Player fullscreen
          </button>
          <button type="button" onClick={exitFullscreen}>
            Exit player fullscreen
          </button>
        </div>
        <Ariakit.DialogDismiss>Close video</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </>
  );
}

function Repro() {
  const fullscreenHostRef = useRef<HTMLDivElement>(null);
  const [fullscreenHostMounted, setFullscreenHostMounted] = useState(true);
  const [mounted, setMounted] = useState(true);
  const [open, setOpen] = useState(false);
  const [pinnedOpen, setPinnedOpen] = useState(false);
  const [showSecond, setShowSecond] = useState(false);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const portalCount = usePortalCount();
  const tooltipOpen = open || pinnedOpen;

  useKeepPortalsInBody();

  const enterFullscreen = () => {
    void fullscreenHostRef.current?.requestFullscreen();
  };

  // The page itself is the fullscreen element, so the fullscreen element
  // contains the body, and the default portal nodes are already visible there.
  // https://github.com/ariakit/ariakit/issues/7763
  const enterPageFullscreen = () => {
    void document.documentElement.requestFullscreen();
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
            <button type="button" onClick={enterPageFullscreen}>
              Enter page fullscreen
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
            <button type="button" onClick={() => setShowSecond(true)}>
              Show second tooltip
            </button>
          </div>
          <div role="status" aria-label="Portal containers">
            Portal containers: {portalCount}
          </div>
          <Ariakit.TooltipProvider>
            <Ariakit.TooltipAnchor render={<button type="button" />}>
              Hover me
            </Ariakit.TooltipAnchor>
            <Ariakit.Tooltip>Fullscreen tooltip</Ariakit.Tooltip>
          </Ariakit.TooltipProvider>
          {showSecond && (
            <Ariakit.TooltipProvider>
              <Ariakit.TooltipAnchor render={<button type="button" />}>
                Second anchor
              </Ariakit.TooltipAnchor>
              <Ariakit.Tooltip>Second tooltip</Ariakit.Tooltip>
            </Ariakit.TooltipProvider>
          )}
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
      {/* The slot is an element of the app outside the fullscreen host. Only a
          default portal node follows the fullscreen element, so the slot and
          the portal node nested in it must keep their place. */}
      <div ref={setSlot} role="group" aria-label="Slot" />
      <Ariakit.Portal portalElement={slot}>
        <p>Slot content</p>
        <Ariakit.Portal>
          <p>Nested content</p>
        </Ariakit.Portal>
      </Ariakit.Portal>
      <VideoDialog />
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
