/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as ak from "@ariakit/react";
import {
  Button,
  ButtonGroup,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Input,
  InputGroup,
  InputSlot,
} from "@ariakit/ui/components/input.ariakit.react";
import { TextFrame } from "@ariakit/ui/components/text-frame.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CodeIcon,
  ExternalLinkIcon,
  GlobeIcon,
  RotateCwIcon,
} from "lucide-react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";
import { useEffect, useId, useRef, useState } from "react";
import {
  getAppThemeRootValues,
  subscribeAppTheme,
} from "#app/lib/app-theme.ts";
import type {
  PreviewCommandMessage,
  PreviewScrollMessage,
  PreviewThemeMessage,
  PreviewViewportMessage,
} from "#app/lib/preview-embed.ts";
import {
  isPreviewFrameMessage,
  PREVIEW_MESSAGE_TYPE,
} from "#app/lib/preview-embed.ts";
import { PREVIEW_FRAME_MARGIN } from "#app/lib/preview-frames.ts";

// Chrome scrolls about 40 pixels for each line of a line-based wheel event.
const WHEEL_LINE_HEIGHT = 40;

// The narrowest preview viewport fits small phones.
const MIN_VIEWPORT_WIDTH = 320;

// Arrow keys resize the viewport by this many pixels, or ten times as many with
// Shift.
const RESIZE_STEP = 16;

export interface PreviewCardProps {
  /**
   * The id of the heading that labels the section around the card.
   */
  headingId: string;
  title: string;
  /**
   * The URL of the preview page.
   */
  href: string;
  /**
   * Renders `children` in the card instead of the preview page in an iframe.
   */
  inline?: boolean;
  /**
   * Gives the iframe the height of a full page.
   */
  fullscreen?: boolean;
  /**
   * Gives the iframe the minimum height of an inline preview, for a small
   * example.
   */
  compact?: boolean;
  /**
   * Renders browser chrome with navigation buttons and the address of the
   * preview page above the iframe.
   */
  browser?: boolean;
  /**
   * The inline preview.
   */
  children?: ReactNode;
  /**
   * The source files that the "Get code" button reveals.
   */
  code?: ReactNode;
}

/**
 * A card that renders a preview in a window-like chrome. The top bar shows the
 * title, or browser controls for previews that navigate between routes, and
 * buttons to reveal the code and to open the preview page in a new tab.
 */
export function PreviewCard({
  headingId,
  title,
  href,
  inline,
  fullscreen,
  compact,
  browser,
  children,
  code,
}: PreviewCardProps) {
  const frame = usePreviewFrame(href);
  return (
    // A card that grows to its grid row gives the extra height to the window,
    // not to the code below it.
    <div className="grid grid-cols-1 grid-rows-[1fr_auto] gap-2">
      <ak.DisclosureProvider>
        <Frame
          // Between the 3xl and 4xl steps, so the window corner reads a little
          // rounder than the macOS browser window while following the theme.
          $rounded="calc(var(--radius)*7)"
          $forceRounded
          $darken={0.5}
          $orientation="vertical"
          $p={1.5}
          className={[
            "grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)]",
            // A preview grid limits the window height, and the viewport row
            // gives up the difference. A frame has a fixed height that the
            // limit would cut off, so only inline previews take it.
            inline ? "max-h-(--preview-card-max-height,none)" : "",
          ].join(" ")}
        >
          <Frame
            $cover
            // Slightly more than the card padding, to suit the rounder corners.
            $p={2}
            className={[
              "flex items-center gap-2 text-sm",
              // Only browser chrome queries the bar width, for the label below.
              // WebKit restyles everything inside query containers that change
              // size on each step of a sidebar fold, which adds up across cards.
              browser ? "@container/bar" : "",
            ].join(" ")}
          >
            <TextFrame
              id={headingId}
              render={<h2 />}
              $p={2}
              $layer="transparent"
              // Browser controls replace the visible title.
              className={browser ? "sr-only" : "flex-1 font-medium"}
            >
              {title}
            </TextFrame>
            {browser && <PreviewCardBrowserControls frame={frame} />}
            <ButtonGroup
              $rounded="xl"
              $p={0}
              $joined={false}
              $gap="xs"
              $layer="transparent"
            >
              <ak.Disclosure render={<Button $ink={80} />}>
                <ButtonSlot>
                  <CodeIcon />
                </ButtonSlot>
                <ButtonLabel
                  // The address needs the room in narrow browser chrome.
                  className={browser ? "@max-lg/bar:sr-only" : undefined}
                >
                  Get code
                </ButtonLabel>
              </ak.Disclosure>
              <Tooltip content="Open preview in a new tab">
                <Button
                  render={
                    <a href={frame.location} target="_blank" rel="noreferrer" />
                  }
                  aria-label="Open preview in a new tab"
                  $ink={80}
                >
                  <ButtonSlot>
                    <ExternalLinkIcon />
                  </ButtonSlot>
                </Button>
              </Tooltip>
            </ButtonGroup>
          </Frame>
          {inline ? (
            <PreviewCardInline>{children}</PreviewCardInline>
          ) : (
            <PreviewCardViewport
              frame={frame}
              title={title}
              href={href}
              // Browser chrome frames a page that navigates between routes, so
              // it gets the same full page height as fullscreen previews.
              fullscreen={fullscreen || browser}
              compact={compact}
            />
          )}
        </Frame>
        <ak.DisclosureContent role="region" aria-label={`${title} code`}>
          {code}
        </ak.DisclosureContent>
      </ak.DisclosureProvider>
    </div>
  );
}

type PreviewFrame = ReturnType<typeof usePreviewFrame>;

/**
 * Follows the location and history of the preview page in the iframe, and sends
 * it the site theme, the viewport radius, and navigation commands.
 */
function usePreviewFrame(href: string) {
  const ref = useRef<HTMLIFrameElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState(href);
  const [loaded, setLoaded] = useState(false);
  const [opening, setOpening] = useState(false);
  const [history, setHistory] = useState({
    canGoBack: false,
    canGoForward: false,
  });
  // A resize with the handle lets the page scroll, as a click in it does. The
  // page cannot see clicks and focus on the docs page, so the card tells it
  // when the person moves on.
  const activatedRef = useRef(false);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    const postTheme = () => {
      postToFrame(iframe, {
        type: PREVIEW_MESSAGE_TYPE,
        action: "theme",
        theme: getAppThemeRootValues(),
      });
      // The theme radius scales the viewport corners. The site theme script
      // subscribed first, so the computed radius is already current.
      const viewport = viewportRef.current;
      if (!viewport) return;
      postToFrame(iframe, {
        type: PREVIEW_MESSAGE_TYPE,
        action: "viewport",
        radius: getInnerRadius(viewport),
      });
    };
    const isFocusInStage = () => {
      const stage = iframe.closest("[data-preview-stage]") ?? iframe;
      return stage.contains(iframe.ownerDocument.activeElement);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      if (!isPreviewFrameMessage(event.data)) return;
      if (event.data.action === "scroll") {
        scrollPage(iframe, event.data);
        return;
      }
      // Each new document in the frame reports its location while it parses, so
      // it gets the theme before it renders.
      postTheme();
      const { href, canGoBack, canGoForward } = event.data;
      // The link to open the preview uses this value.
      if (isWebUrl(href)) {
        setLocation(href);
      }
      setHistory({ canGoBack, canGoForward });
      // A reload or a full page navigation in the frame reports a new document
      // that has not loaded yet.
      setLoaded(event.data.loaded);
      setOpening(event.data.opening ?? false);
      // A new document starts inactive, and it could not receive an activation
      // sent while it loaded. Focus in another frame means the person moved on.
      if (!event.data.loaded && activatedRef.current && isFocusInStage()) {
        postToFrame(iframe, { type: PREVIEW_MESSAGE_TYPE, action: "activate" });
      }
    };
    window.addEventListener("message", onMessage);
    const unsubscribeTheme = subscribeAppTheme(postTheme);
    // The frame may have loaded before hydration, so ask for its state.
    postToFrame(iframe, { type: PREVIEW_MESSAGE_TYPE, action: "sync" });
    return () => {
      window.removeEventListener("message", onMessage);
      unsubscribeTheme();
    };
  }, []);

  const send = (action: PreviewCommandMessage["action"]) => {
    const iframe = ref.current;
    if (!iframe) return;
    postToFrame(iframe, { type: PREVIEW_MESSAGE_TYPE, action });
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const doc = viewport.ownerDocument;
    const stage = viewport.closest("[data-preview-stage]") ?? viewport;
    const isInStage = (target: EventTarget | null) => {
      return target instanceof Node && stage.contains(target);
    };
    const postDeactivate = () => {
      const iframe = ref.current;
      if (!iframe) return;
      postToFrame(iframe, { type: PREVIEW_MESSAGE_TYPE, action: "deactivate" });
    };
    const deactivate = () => {
      if (!activatedRef.current) return;
      activatedRef.current = false;
      postDeactivate();
    };
    const onInteraction = (event: Event) => {
      if (isInStage(event.target)) return;
      deactivate();
    };
    // A touch on the docs page can scroll it without taking focus from the
    // frame, which would keep the frame active.
    const onPointerDown = (event: PointerEvent) => {
      if (isInStage(event.target)) return;
      if (event.pointerType !== "mouse" && doc.activeElement === ref.current) {
        activatedRef.current = false;
        postDeactivate();
        return;
      }
      deactivate();
    };
    // A click in another preview frame moves focus to it without a pointer or
    // focus event in this document. Switching apps keeps focus on the handle.
    let blurTimeout = 0;
    const onBlur = () => {
      clearTimeout(blurTimeout);
      blurTimeout = window.setTimeout(() => {
        if (isInStage(doc.activeElement)) return;
        deactivate();
      });
    };
    doc.addEventListener("pointerdown", onPointerDown, true);
    doc.addEventListener("focusin", onInteraction, true);
    window.addEventListener("blur", onBlur);
    return () => {
      clearTimeout(blurTimeout);
      doc.removeEventListener("pointerdown", onPointerDown, true);
      doc.removeEventListener("focusin", onInteraction, true);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const activate = () => {
    activatedRef.current = true;
    send("activate");
  };

  // A page can open its popup after the frame loads, so the card waits for
  // both.
  const ready = loaded && !opening;

  return {
    ref,
    viewportRef,
    location,
    ready,
    setLoaded,
    history,
    send,
    activate,
  };
}

function PreviewCardBrowserControls({ frame }: { frame: PreviewFrame }) {
  const { history, send } = frame;
  return (
    <>
      <ButtonGroup
        aria-label="Navigation"
        $rounded="xl"
        $p={0}
        $joined={false}
        $gap="xs"
        $layer="transparent"
      >
        <Tooltip content="Back">
          <Button
            aria-label="Back"
            // Keeps focus when going back reaches the first entry.
            accessibleWhenDisabled
            disabled={!history.canGoBack}
            onClick={() => send("back")}
            $ink={80}
          >
            <ButtonSlot>
              <ArrowLeftIcon />
            </ButtonSlot>
          </Button>
        </Tooltip>
        <Tooltip content="Forward">
          <Button
            aria-label="Forward"
            accessibleWhenDisabled
            disabled={!history.canGoForward}
            onClick={() => send("forward")}
            $ink={80}
          >
            <ButtonSlot>
              <ArrowRightIcon />
            </ButtonSlot>
          </Button>
        </Tooltip>
        <Tooltip content="Reload">
          <Button aria-label="Reload" onClick={() => send("reload")} $ink={80}>
            <ButtonSlot>
              <RotateCwIcon />
            </ButtonSlot>
          </Button>
        </Tooltip>
      </ButtonGroup>
      <InputGroup $rounded="full" $border={false} className="min-w-0 flex-1">
        <InputSlot aria-hidden $ink={60}>
          <GlobeIcon />
        </InputSlot>
        <Input
          readOnly
          aria-label="Address"
          value={getAddress(frame.location)}
        />
      </InputGroup>
    </>
  );
}

interface PreviewCardViewportProps {
  frame: PreviewFrame;
  title: string;
  href: string;
  fullscreen?: boolean;
  compact?: boolean;
}

function getFrameHeight({
  fullscreen,
  compact,
}: Pick<PreviewCardViewportProps, "fullscreen" | "compact">) {
  // The Ariakit UI spacing scale follows the font size, so the heights are in
  // rem.
  if (fullscreen) return "h-[40rem]";
  // Outside a preview grid, an inline preview has no minimum height, so a
  // compact frame keeps the default height there.
  if (compact) return "h-(--preview-card-min-height,25rem)";
  return "h-[25rem]";
}

function PreviewCardViewport({
  frame,
  title,
  href,
  fullscreen,
  compact,
}: PreviewCardViewportProps) {
  const { ref, viewportRef, ready, setLoaded, activate } = frame;
  const near = useNearViewport(ref);
  return (
    <PreviewCardStage measuring={near} onResize={activate}>
      {({ viewportId, resizing }) => (
        <Frame
          ref={viewportRef}
          id={viewportId}
          $border
          $layer="canvas"
          $p="none"
          className="grid grid-cols-1 overflow-clip"
        >
          <div
            data-loading={ready ? undefined : ""}
            aria-busy={!ready}
            className="group/preview grid grid-cols-1 *:[grid-area:1/1]"
          >
            {/* The page script in preview-card.astro sets the width of the frame,
                often before the card hydrates. React renders no style here, so
                the style attribute is not a mismatch. */}
            <iframe
              ref={ref}
              suppressHydrationWarning
              data-preview-frame
              src={href}
              title={title}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              className={[
                "block w-full border-0 bg-transparent transition-opacity",
                getFrameHeight({ fullscreen, compact }),
                "group-data-loading/preview:opacity-0",
                // Without scripts, nothing reports the load, so the frame shows
                // right away.
                "[@media(scripting:none)]:opacity-100!",
              ].join(" ")}
            />
            {/* Keeps a drag from the handle out of the frame. Pointer-events on
                the frame could leave Chrome sending the wheel to the docs page.
                It is positioned to stay above the frame while it fades in.
                https://github.com/ariakit/ariakit/issues/8054 */}
            {resizing && (
              <div aria-hidden className="relative cursor-ew-resize" />
            )}
            <div
              aria-hidden
              className={[
                "pointer-events-none hidden place-items-center",
                "group-data-loading/preview:grid",
                "[@media(scripting:none)]:hidden!",
              ].join(" ")}
            >
              <PreviewCardLoader />
            </div>
          </div>
        </Frame>
      )}
    </PreviewCardStage>
  );
}

/**
 * The Ariakit symbol, with its dot rolling around the ring while the preview
 * loads.
 */
function PreviewCardLoader() {
  return (
    <span className="ak-text ak-text-primary relative size-10 motion-reduce:animate-pulse">
      <svg viewBox="0 0 40 40" className="size-full fill-current">
        <path
          fillRule="evenodd"
          d="M8 0C3.58172 0 0 3.58172 0 8V32C0 36.4183 3.58172 40 8 40H32C36.4183 40 40 36.4183 40 32V8C40 3.58172 36.4183 0 32 0H8ZM19.9998 31.9997C26.6272 31.9997 31.9998 26.6271 31.9998 19.9997C31.9998 13.3723 26.6272 7.99967 19.9998 7.99967C13.3723 7.99967 7.99976 13.3723 7.99976 19.9997C7.99976 26.6271 13.3723 31.9997 19.9998 31.9997Z"
        />
      </svg>
      {/* The dot rests 4 units off the center of the ring, so turning its own
          svg around the center moves it in a circle inside the ring. Safari
          runs the animation of a group inside an svg on the main thread, even
          offscreen, and Chrome lays out the svg again on each frame. */}
      <svg
        viewBox="0 0 40 40"
        className="absolute inset-0 size-full fill-current motion-safe:animate-[spin_1.4s_cubic-bezier(0.65,0,0.35,1)_infinite]"
      >
        <circle cx="24" cy="20" r="6" />
      </svg>
    </span>
  );
}

interface PreviewCardInlineProps {
  children?: ReactNode;
}

/** Renders an example directly in the card, without an iframe. */
function PreviewCardInline({ children }: PreviewCardInlineProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const activate = useInactiveScroll(viewportRef);
  return (
    <PreviewCardStage onResize={activate}>
      {({ viewportId }) => (
        // Match the font size of the preview page. It also makes the em-based
        // padding reach the 1rem frame cap, so the example keeps its own corner
        // radius instead of a concentric one. Firefox resolves the padding
        // against the parent font size, so a wrapper sets it.
        <div className="grid grid-cols-1 grid-rows-[minmax(0,1fr)] text-base">
          <Frame
            ref={viewportRef}
            id={viewportId}
            // A click anywhere in the example moves focus into it, which lets
            // it scroll, like a click in a preview frame.
            tabIndex={-1}
            $border
            $layer="canvas"
            $p={8}
            className={[
              "grid grid-cols-1 place-items-center overflow-auto",
              "min-h-(--preview-card-min-height,auto)",
              // An example taller than the viewport starts at the top, so all
              // of it can scroll into view.
              "content-center-safe",
              // The global island styles inherit the grid display, which would
              // size the example to its content. Without their boxes, the
              // example is a grid item that fits the card.
              "[&_:is(astro-island,astro-slot,astro-static-slot)]:contents!",
            ].join(" ")}
          >
            {children}
          </Frame>
        </div>
      )}
    </PreviewCardStage>
  );
}

interface PreviewCardStageState {
  viewportId: string;
  resizing: boolean;
}

interface PreviewCardStageProps {
  children: (state: PreviewCardStageState) => ReactNode;
  /**
   * Whether the stage follows the card width. See `usePreviewResize`.
   * @default true
   */
  measuring?: boolean;
  /**
   * Called when the person starts a drag or presses a key on the resize handle.
   */
  onResize?: () => void;
}

/**
 * Holds the preview viewport and the handle that resizes it. The viewport fills
 * the stage until the handle makes it narrower.
 */
function PreviewCardStage({
  children,
  measuring = true,
  onResize,
}: PreviewCardStageProps) {
  const viewportId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const resize = usePreviewResize(stageRef, measuring, onResize);
  return (
    <div
      ref={stageRef}
      data-preview-stage
      // The rows pass a limited window height down to the viewport.
      className="grid grid-cols-1 grid-rows-[minmax(0,1fr)]"
    >
      <div
        className="relative grid w-full max-w-full grid-cols-1 grid-rows-[minmax(0,1fr)] justify-self-start"
        style={resize.width == null ? undefined : { width: resize.width }}
      >
        {children({ viewportId, resizing: resize.resizing })}
        <PreviewCardResizeHandle resize={resize} viewportId={viewportId} />
      </div>
    </div>
  );
}

/**
 * Returns whether the element is near the viewport, with the same margin that
 * the page script uses to fix the width of offscreen preview frames.
 */
function useNearViewport(ref: RefObject<Element | null>) {
  const [near, setNear] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (!entry) return;
        setNear(entry.isIntersecting);
      },
      { rootMargin: PREVIEW_FRAME_MARGIN },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return near;
}

type PreviewResize = ReturnType<typeof usePreviewResize>;

/**
 * Keeps the width of a preview viewport between the narrowest phone width and
 * the full width of the stage element. A viewport at the full width follows the
 * stage when the page resizes. The stage is measured only while `measuring` is
 * true, so offscreen cards do not render on each step of a page resize.
 */
function usePreviewResize(
  stageRef: RefObject<HTMLElement | null>,
  measuring: boolean,
  onResize?: () => void,
) {
  const dragRef = useRef<{ x: number; width: number; sign: number }>(null);
  const [stageWidth, setStageWidth] = useState<number>();
  const [width, setWidth] = useState<number | null>(null);
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    if (!measuring) return;
    const stage = stageRef.current;
    if (!stage) return;
    // A new observer reports the current size, so the stage width catches up
    // with resizes that happened while the card was offscreen.
    const observer = new ResizeObserver(() => {
      setStageWidth(Math.floor(stage.getBoundingClientRect().width));
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [stageRef, measuring]);

  const maxWidth = stageWidth ?? 0;
  const minWidth = Math.min(MIN_VIEWPORT_WIDTH, maxWidth);
  const currentWidth = width == null ? maxWidth : Math.min(width, maxWidth);

  const resizeTo = (nextWidth: number) => {
    if (nextWidth >= maxWidth) {
      setWidth(null);
      return;
    }
    setWidth(Math.max(minWidth, Math.round(nextWidth)));
  };

  const startDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    // Keeps the drag from selecting text on the page.
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    // The prevented pointerdown does not move focus, but an active preview
    // checks that focus is in its stage.
    handle.focus({ preventScroll: true });
    onResize?.();
    dragRef.current = {
      x: event.clientX,
      width: currentWidth,
      sign: getInlineSign(handle),
    };
    setResizing(true);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    resizeTo(drag.width + (event.clientX - drag.x) * drag.sign);
  };

  const endDrag = () => {
    dragRef.current = null;
    setResizing(false);
  };

  return {
    width,
    resizing,
    // The handle needs a measured card, and room to resize.
    enabled: maxWidth > MIN_VIEWPORT_WIDTH,
    minWidth,
    maxWidth,
    currentWidth,
    resizeTo,
    onResize,
    startDrag,
    moveDrag,
    endDrag,
  };
}

interface PreviewCardResizeHandleProps {
  resize: PreviewResize;
  viewportId: string;
}

/**
 * A window splitter on the end edge of the preview viewport. Drag it or use the
 * arrow keys to resize the viewport. Home and End resize it to the narrowest
 * and the full width. A double click restores the full width.
 */
function PreviewCardResizeHandle({
  resize,
  viewportId,
}: PreviewCardResizeHandleProps) {
  const { minWidth, maxWidth, currentWidth, resizeTo } = resize;

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const step = event.shiftKey ? RESIZE_STEP * 10 : RESIZE_STEP;
    const sign = getInlineSign(event.currentTarget);
    switch (event.key) {
      case "ArrowLeft":
        resizeTo(currentWidth - step * sign);
        break;
      case "ArrowRight":
        resizeTo(currentWidth + step * sign);
        break;
      case "Home":
        resizeTo(minWidth);
        break;
      case "End":
        resizeTo(maxWidth);
        break;
      default:
        return;
    }
    event.preventDefault();
    resize.onResize?.();
  };

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label="Resize preview"
      aria-orientation="vertical"
      aria-controls={viewportId}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      aria-valuenow={currentWidth}
      aria-valuetext={`${currentWidth} pixels wide`}
      data-enabled={resize.enabled || undefined}
      data-resizing={resize.resizing || undefined}
      onKeyDown={onKeyDown}
      onPointerDown={resize.startDrag}
      onPointerMove={resize.moveDrag}
      onPointerUp={resize.endDrag}
      onPointerCancel={resize.endDrag}
      onLostPointerCapture={resize.endDrag}
      onDoubleClick={() => resizeTo(maxWidth)}
      className={[
        // Centers the grip in the 1.5-step card padding at the full width. The
        // hit area overlaps the frame by 1.25 steps, less than a classic
        // scrollbar at the end edge of the frame.
        "group/resize absolute inset-y-0 -inset-e-2.75 z-1 grid w-4 place-items-center",
        "cursor-ew-resize touch-none outline-none",
        // The handle renders from the start and shows once the card has room
        // to resize. Inserting it later would match broad :has() rules of the
        // page shell, which restyles the whole page as each card hydrates.
        "not-data-enabled:hidden",
        // A card that shares a row in a preview grid keeps its width, even
        // when a narrow grid stacks the cards.
        "[.preview-grid>:not(.col-span-full)_&]:hidden!",
        // On touch screens, the handle would take swipes at the card edge.
        "pointer-coarse:hidden!",
      ].join(" ")}
    >
      <Frame
        render={<span />}
        $rounded="full"
        $forceRounded
        $p="none"
        $layer
        $contrast
        className={[
          "h-10 w-1 transition-[height] duration-150",
          "group-hover/resize:h-14 group-data-resizing/resize:h-14",
          "group-focus-visible/resize:h-14 group-focus-visible/resize:outline-2",
          "group-focus-visible/resize:outline-offset-2 ak-outline ak-outline-brand",
        ].join(" ")}
      />
    </div>
  );
}

/**
 * Returns the radius of the corners inside the element's border, which clip its
 * content.
 */
function getInnerRadius(element: Element) {
  const style = getComputedStyle(element);
  const radius = Number.parseFloat(style.borderStartStartRadius);
  const border = Number.parseFloat(style.borderBlockStartWidth);
  return `${Math.max(0, radius - border)}px`;
}

/**
 * Returns 1 when the inline end of the element is on the right, and -1 when it
 * is on the left.
 */
function getInlineSign(element: Element) {
  return getComputedStyle(element).direction === "rtl" ? -1 : 1;
}

function postToFrame(
  iframe: HTMLIFrameElement,
  message: PreviewCommandMessage | PreviewThemeMessage | PreviewViewportMessage,
) {
  // Next.js previews load from another origin.
  iframe.contentWindow?.postMessage(message, "*");
}

function isWebUrl(href: string) {
  if (!URL.canParse(href)) return false;
  const { protocol } = new URL(href);
  return protocol === "http:" || protocol === "https:";
}

function getAddress(location: string) {
  const url = new URL(location, "http://localhost");
  return `${url.pathname}${url.search}${url.hash}`;
}

function getScrollParent(element: Element) {
  let parent = element.parentElement;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    const scrollable = /auto|scroll/.test(overflowY);
    if (scrollable && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return element.ownerDocument.scrollingElement;
}

type WheelDelta = Pick<PreviewScrollMessage, "deltaX" | "deltaY" | "deltaMode">;

/**
 * Scrolls the page around an inactive preview with a wheel event that the
 * preview received over one of its own scroll containers.
 */
function scrollPage(element: Element, wheel: WheelDelta) {
  const scrollParent = getScrollParent(element);
  if (!scrollParent) return;
  const getDelta = (delta: number, pageSize: number) => {
    if (wheel.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      return delta * WHEEL_LINE_HEIGHT;
    }
    if (wheel.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      return delta * pageSize;
    }
    return delta;
  };
  scrollParent.scrollBy({
    left: getDelta(wheel.deltaX, scrollParent.clientWidth),
    top: getDelta(wheel.deltaY, scrollParent.clientHeight),
    behavior: "instant",
  });
}

/**
 * Returns whether the element keeps wheel scrolling from reaching the page. A
 * container with contained overscroll, such as a popover, does so even when its
 * content fits.
 */
function isScrollContainer(element: Element) {
  const style = getComputedStyle(element);
  const scrollsY =
    /auto|scroll/.test(style.overflowY) &&
    (element.scrollHeight > element.clientHeight ||
      style.overscrollBehaviorY !== "auto");
  const scrollsX =
    /auto|scroll/.test(style.overflowX) &&
    (element.scrollWidth > element.clientWidth ||
      style.overscrollBehaviorX !== "auto");
  return scrollsY || scrollsX;
}

/**
 * Returns whether the document shows classic scrollbars, which take room.
 * Stopping a scroll container would hide its scrollbar and reflow its content,
 * as on a laptop with a touch screen. Phones and tablets show overlay
 * scrollbars, which take none.
 */
function hasClassicScrollbars(doc: Document) {
  const probe = doc.createElement("div");
  probe.style.cssText =
    "position: fixed; width: 100px; height: 100px; overflow: scroll; visibility: hidden";
  doc.body.appendChild(probe);
  const classic = probe.offsetWidth > probe.clientWidth;
  probe.remove();
  return classic;
}

function hasScrollOverflow(element: Element) {
  const style = getComputedStyle(element);
  return (
    /auto|scroll/.test(style.overflowX) || /auto|scroll/.test(style.overflowY)
  );
}

/**
 * Lets an inline preview scroll only after a click, a tap, or focus moves into
 * it, as a preview frame does. Until then, wheel events and touches over its
 * scroll containers scroll the page, so scrolling the page over the card does
 * not get stuck in it. Returns a function that activates the preview, such as
 * when the person resizes it with the handle.
 */
function useInactiveScroll(ref: RefObject<HTMLElement | null>) {
  const activeRef = useRef(false);
  // Lets the returned function update the touch scroll lock.
  const activeChangeRef = useRef<() => void>(undefined);

  useEffect(() => {
    const viewport = ref.current;
    if (!viewport) return;
    const doc = viewport.ownerDocument;
    // The resize handle keeps focus while it resizes an active preview.
    const stage = viewport.closest("[data-preview-stage]") ?? viewport;
    // The preview stays active until a click or focus moves elsewhere. Focus
    // can also fall back to the body, such as when a focused button becomes
    // disabled, which keeps a preview frame active too.
    activeRef.current = viewport.contains(doc.activeElement);
    const isInViewport = (target: EventTarget | null) => {
      return target instanceof Node && viewport.contains(target);
    };
    const isActive = () => {
      if (!activeRef.current) return false;
      const focused = doc.activeElement;
      // A click in a preview frame moves focus to it without a pointer or focus
      // event in this document.
      if (!focused) return true;
      if (focused === doc.body) return true;
      return stage.contains(focused);
    };

    // A touch cannot pass its scrolling to the page like the wheel. On a touch
    // screen, an inactive preview stops its scroll containers, so the browser
    // scrolls the page. See global.css. The browser picks the scroller when a
    // touch starts, and iOS Safari cancels the touch if that scroller stops
    // during it, so the containers stop before any touch. This includes
    // containers whose content fits, since it can overflow later without a DOM
    // change, such as when the viewport rotates.
    const touchScreen = window.matchMedia("(any-pointer: coarse)");
    const scrollLocked = new Set<Element>();
    let lockable = false;
    const updateScrollLock = () => {
      const locked = lockable && !isActive();
      for (const element of scrollLocked) {
        if (locked && viewport.contains(element)) continue;
        element.removeAttribute("data-preview-scroll-lock");
        scrollLocked.delete(element);
      }
      if (!locked) return;
      for (const element of [viewport, ...viewport.querySelectorAll("*")]) {
        if (scrollLocked.has(element)) continue;
        if (!hasScrollOverflow(element)) continue;
        // Hydration would report the attribute on server-rendered containers as
        // a mismatch, so islands wait until they drop ssr. React can still be
        // hydrating then, which only development builds report.
        if (element.closest("astro-island[ssr]")) continue;
        element.setAttribute("data-preview-scroll-lock", "");
        scrollLocked.add(element);
      }
    };
    // Waits for focus to settle, and lets a burst of changes update the lock
    // once.
    let scrollLockFrame = 0;
    const scheduleScrollLock = () => {
      if (scrollLockFrame) return;
      scrollLockFrame = requestAnimationFrame(() => {
        scrollLockFrame = 0;
        updateScrollLock();
      });
    };
    activeChangeRef.current = scheduleScrollLock;
    // Scroll containers, such as popups, can appear in the example.
    const scrollLockObserver = new MutationObserver((records) => {
      const changed = records.some(
        (record) => record.attributeName !== "data-preview-scroll-lock",
      );
      if (!changed) return;
      scheduleScrollLock();
    });
    const observeScrollLock = () => {
      scrollLockObserver.disconnect();
      lockable = touchScreen.matches && !hasClassicScrollbars(doc);
      if (lockable) {
        scrollLockObserver.observe(viewport, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }
      updateScrollLock();
    };

    // Runs in the capture phase, before the handle activates the preview.
    const updateActive = (event: Event) => {
      activeRef.current = isInViewport(event.target);
      scheduleScrollLock();
    };
    // A touch or pen in the example can start a scroll of the page, so only the
    // click of a tap activates the preview. A tap that stops a scrolling page
    // does not click.
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && isInViewport(event.target)) return;
      updateActive(event);
    };
    // iOS Safari clicks on a tap only when an ancestor of the target below the
    // body listens to clicks, so the listener is on the viewport.
    const onClick = () => {
      activeRef.current = true;
      scheduleScrollLock();
    };
    const isInScrollContainer = (target: EventTarget | null) => {
      // The listener is on the viewport, so the target is in its document.
      let element = target instanceof Element ? target : null;
      while (element) {
        if (isScrollContainer(element)) return true;
        if (element === viewport) return false;
        element = element.parentElement;
      }
      return false;
    };
    const onWheel = (event: WheelEvent) => {
      if (isActive()) return;
      // Pinch zoom on trackpads sends wheel events with ctrlKey.
      if (event.ctrlKey) return;
      if (!isInScrollContainer(event.target)) return;
      event.preventDefault();
      scrollPage(viewport, event);
    };
    observeScrollLock();
    touchScreen.addEventListener("change", observeScrollLock);
    doc.addEventListener("pointerdown", onPointerDown, true);
    doc.addEventListener("focusin", updateActive, true);
    // Focus that moves to a preview frame blurs the window.
    window.addEventListener("blur", scheduleScrollLock);
    // A media query can make an element a scroll container.
    window.addEventListener("resize", scheduleScrollLock);
    viewport.addEventListener("click", onClick, true);
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(scrollLockFrame);
      scrollLockObserver.disconnect();
      activeChangeRef.current = undefined;
      for (const element of scrollLocked) {
        element.removeAttribute("data-preview-scroll-lock");
      }
      touchScreen.removeEventListener("change", observeScrollLock);
      doc.removeEventListener("pointerdown", onPointerDown, true);
      doc.removeEventListener("focusin", updateActive, true);
      window.removeEventListener("blur", scheduleScrollLock);
      window.removeEventListener("resize", scheduleScrollLock);
      viewport.removeEventListener("click", onClick, true);
      viewport.removeEventListener("wheel", onWheel);
    };
  }, [ref]);

  return () => {
    activeRef.current = true;
    activeChangeRef.current?.();
  };
}
