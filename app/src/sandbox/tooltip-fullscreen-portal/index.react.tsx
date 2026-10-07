import * as Ariakit from "@ariakit/react";
import type { CSSProperties, ReactNode } from "react";
import { StrictMode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

// The playlist is shorter than its tracks, so it has a scroll position.
const playlistStyle = {
  ...popupStyle,
  display: "block",
  maxHeight: 96,
  overflow: "auto",
} satisfies CSSProperties;

const tracks = Array.from({ length: 12 }, (_, index) => `Track ${index + 1}`);

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
            <Ariakit.Popover portal aria-label="Quality" style={popupStyle}>
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
        </div>
        <Ariakit.DialogDismiss>Close movie</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </>
  );
}

// The movie dialog is nested in the library dialog, so the portal node of the
// movie dialog is a nested portal node that contains the fullscreen player. A
// portal node can't move into its own descendant, so it must keep its place.
// https://github.com/ariakit/ariakit/issues/7761
function LibraryDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open library
      </button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        style={dialogStyle}
      >
        <Ariakit.DialogHeading>Library</Ariakit.DialogHeading>
        <MovieDialog />
        <Ariakit.DialogDismiss>Close library</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </>
  );
}

interface ShadowHostProps {
  children: ReactNode;
}

// Renders its children inside an open shadow root, the way a web component that
// hosts a React app does.
function ShadowHost({ children }: ShadowHostProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    setRoot(host.shadowRoot || host.attachShadow({ mode: "open" }));
  }, []);
  return <div ref={hostRef}>{root && createPortal(children, root)}</div>;
}

// The player is inside a shadow tree, so the fullscreen element of the document
// is the shadow host, and only the shadow root gives the player. The host has
// no slot, so it doesn't display a portal node that is its child. The popups
// must render inside the player while it is in fullscreen.
// https://github.com/ariakit/ariakit/issues/7773
function ShadowPlayer() {
  const playerRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState("Normal");
  const [audio, setAudio] = useState("Stereo");

  const enterFullscreen = () => {
    void playerRef.current?.requestFullscreen();
  };

  return (
    <ShadowHost>
      <div
        ref={playerRef}
        role="group"
        aria-label="Shadow player"
        style={moviePlayerStyle}
      >
        <button type="button" onClick={enterFullscreen}>
          Shadow player fullscreen
        </button>
        <button type="button" onClick={exitFullscreen}>
          Exit shadow player fullscreen
        </button>
        <Ariakit.PopoverProvider>
          <Ariakit.PopoverDisclosure>Speed</Ariakit.PopoverDisclosure>
          {/* This popup stays mounted while it is hidden, so its portal node
              exists before the player enters fullscreen. */}
          <Ariakit.Popover portal aria-label="Speed" style={popupStyle}>
            <button type="button" onClick={() => setSpeed("Fast")}>
              Fast
            </button>
            <button type="button" onClick={() => setSpeed("Slow")}>
              Slow
            </button>
          </Ariakit.Popover>
        </Ariakit.PopoverProvider>
        <Ariakit.PopoverProvider>
          <Ariakit.PopoverDisclosure>Audio</Ariakit.PopoverDisclosure>
          {/* This popup mounts when it opens, so its portal node can mount
              while the player is in fullscreen. */}
          <Ariakit.Popover
            portal
            unmountOnHide
            aria-label="Audio"
            style={popupStyle}
          >
            <button type="button" onClick={() => setAudio("Mono")}>
              Mono
            </button>
            <button type="button" onClick={() => setAudio("Surround")}>
              Surround
            </button>
          </Ariakit.Popover>
        </Ariakit.PopoverProvider>
        <div role="status" aria-label="Shadow playback">
          Speed: {speed}. Audio: {audio}.
        </div>
      </div>
    </ShadowHost>
  );
}

function FramePlayerContent() {
  const playerRef = useRef<HTMLDivElement>(null);

  const enterFullscreen = () => {
    void playerRef.current?.requestFullscreen();
  };

  // The player is the fullscreen element of the document of the frame.
  const exitFrameFullscreen = () => {
    const frameDocument = playerRef.current?.ownerDocument;
    if (!frameDocument?.fullscreenElement) return;
    void frameDocument.exitFullscreen();
  };

  return (
    <div ref={playerRef} style={playerStyle}>
      <button type="button" onClick={enterFullscreen}>
        Frame fullscreen
      </button>
      <button type="button" onClick={exitFrameFullscreen}>
        Exit frame fullscreen
      </button>
    </div>
  );
}

interface FramePlayerProps {
  title: string;
}

// While the player of the frame is in fullscreen, the fullscreen element of
// this document is the iframe, which doesn't display its children. The portal
// node of the playlist must keep its place, because each move of the node
// resets the scroll position of the playlist.
// https://github.com/ariakit/ariakit/issues/7773
function FramePlayer({ title }: FramePlayerProps) {
  const [frameBody, setFrameBody] = useState<HTMLElement | null>(null);
  const frameRef = useCallback((element: HTMLIFrameElement | null) => {
    setFrameBody(element?.contentDocument?.body ?? null);
  }, []);

  return (
    <>
      <iframe ref={frameRef} title={title} allowFullScreen />
      {frameBody && createPortal(<FramePlayerContent />, frameBody)}
      <Ariakit.PopoverProvider>
        <Ariakit.PopoverDisclosure>Playlist</Ariakit.PopoverDisclosure>
        {/* The playlist stays open when the user interacts with the frame, the
            way a panel next to a player does. */}
        <Ariakit.Popover
          portal
          hideOnInteractOutside={false}
          aria-label="Playlist"
          style={playlistStyle}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {tracks.map((track) => (
              <li key={track}>{track}</li>
            ))}
          </ul>
        </Ariakit.Popover>
      </Ariakit.PopoverProvider>
    </>
  );
}

// The players are inside a modal dialog, so the portal nodes of their popups
// are children of the portal node of the dialog. A shadow host and an iframe
// inside that portal node must not become the place of those nested portal
// nodes either.
// https://github.com/ariakit/ariakit/issues/7773
function TheaterDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open theater
      </button>
      {/* The players mount when the dialog opens. StrictMode replaces the
          portal node of a dialog on mount, and happy-dom discards the document
          of a frame that leaves the page, so React can't remove the content of
          the frame in test.ts if the frame mounts with the page. */}
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        unmountOnHide
        style={dialogStyle}
      >
        <Ariakit.DialogHeading>Theater</Ariakit.DialogHeading>
        <ShadowPlayer />
        <FramePlayer title="Theater frame player" />
        <Ariakit.DialogDismiss>Close theater</Ariakit.DialogDismiss>
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
      <LibraryDialog />
      <ShadowPlayer />
      <FramePlayer title="Frame player" />
      <TheaterDialog />
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
