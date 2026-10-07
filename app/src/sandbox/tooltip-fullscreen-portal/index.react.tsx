import * as Ariakit from "@ariakit/react";
import type { CSSProperties } from "react";
import { StrictMode, useEffect, useRef, useState } from "react";

const tooltipId = "tooltip-repro";
const portalSelector = `[id="portal/${tooltipId}"]`;

const dialogStyle = {
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
} satisfies CSSProperties;

const playerStyle = {
  background: "white",
  color: "black",
  display: "flex",
  gap: 8,
  padding: 24,
} satisfies CSSProperties;

// The buttons keep their height in the fullscreen player, so each popup opens
// below its button, and not at the bottom edge of the screen.
const moviePlayerStyle = {
  ...playerStyle,
  alignItems: "flex-start",
} satisfies CSSProperties;

// The popups have the z-index of the dialog, so they render above it when their
// portal nodes are next to the dialog.
const popupStyle = {
  background: "white",
  border: "1px solid",
  color: "black",
  display: "flex",
  gap: 8,
  padding: 8,
  zIndex: 50,
} satisfies CSSProperties;

function exitFullscreen() {
  if (!document.fullscreenElement) return;
  void document.exitFullscreen();
}

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

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open video
      </button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        style={dialogStyle}
      >
        <Ariakit.DialogHeading>Video</Ariakit.DialogHeading>
        <div
          ref={playerRef}
          role="group"
          aria-label="Player"
          style={playerStyle}
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

// The popups are inside the player, but their portal nodes are children of the
// portal node of the modal dialog, outside the player. The browser shows only
// the fullscreen element and its descendants, so the popups must render inside
// the player while it is in fullscreen.
// https://github.com/ariakit/ariakit/issues/7761
function MovieDialog() {
  const playerRef = useRef<HTMLDivElement>(null);
  // TODO: Remove the popups element and portalElement when the fix is released.
  // The popups render in an element inside the player, so they are inside the
  // fullscreen element. The element is in state, and not in a ref, so the
  // popups render again with the element after it mounts.
  // https://github.com/ariakit/ariakit/issues/7761
  const [popups, setPopups] = useState<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [quality, setQuality] = useState("Auto");
  const [captions, setCaptions] = useState("Off");

  const enterFullscreen = () => {
    void playerRef.current?.requestFullscreen();
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open movie
      </button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        style={dialogStyle}
      >
        <Ariakit.DialogHeading>Movie</Ariakit.DialogHeading>
        <div
          ref={playerRef}
          role="group"
          aria-label="Movie player"
          style={moviePlayerStyle}
        >
          <button type="button" onClick={enterFullscreen}>
            Movie fullscreen
          </button>
          <button type="button" onClick={exitFullscreen}>
            Exit movie fullscreen
          </button>
          <Ariakit.PopoverProvider>
            <Ariakit.PopoverDisclosure>Quality</Ariakit.PopoverDisclosure>
            {/* This popup stays mounted while it is hidden, so its portal node
                exists before the player enters fullscreen. */}
            <Ariakit.Popover
              portal
              portalElement={popups}
              aria-label="Quality"
              style={popupStyle}
            >
              <button type="button" onClick={() => setQuality("High")}>
                High
              </button>
              <button type="button" onClick={() => setQuality("Low")}>
                Low
              </button>
            </Ariakit.Popover>
          </Ariakit.PopoverProvider>
          <Ariakit.PopoverProvider>
            <Ariakit.PopoverDisclosure>Captions</Ariakit.PopoverDisclosure>
            {/* This popup mounts when it opens, so its portal node can mount
                while the player is in fullscreen. */}
            <Ariakit.Popover
              portal
              portalElement={popups}
              unmountOnHide
              aria-label="Captions"
              style={popupStyle}
            >
              <button type="button" onClick={() => setCaptions("English")}>
                English
              </button>
              <button type="button" onClick={() => setCaptions("Spanish")}>
                Spanish
              </button>
            </Ariakit.Popover>
          </Ariakit.PopoverProvider>
          <div role="status" aria-label="Playback">
            Quality: {quality}. Captions: {captions}.
          </div>
          <div ref={setPopups} />
        </div>
        <Ariakit.DialogDismiss>Close movie</Ariakit.DialogDismiss>
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

  const enterFullscreen = () => {
    void fullscreenHostRef.current?.requestFullscreen();
  };

  // The page itself is the fullscreen element, so the fullscreen element
  // contains the body, and the default portal nodes are already visible there.
  // https://github.com/ariakit/ariakit/issues/7763
  const enterPageFullscreen = () => {
    void document.documentElement.requestFullscreen();
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
      <MovieDialog />
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
