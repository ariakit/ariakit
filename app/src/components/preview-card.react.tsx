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

// Chrome scrolls about 40 pixels for each line of a line-based wheel event.
const WHEEL_LINE_HEIGHT = 40;

// The narrowest preview viewport fits small phones.
const MIN_VIEWPORT_WIDTH = 320;

// Arrow keys resize the viewport by this many pixels, or ten times as many with
// Shift.
const RESIZE_STEP = 16;

// A frame follows the card width again a little before it scrolls into view, so
// its one catch-up layout happens offscreen.
const OFFSCREEN_MARGIN = "200px";

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
   * Renders browser chrome with navigation buttons and the address of the
   * preview page above the iframe.
   */
  browser?: boolean;
  /**
   * The inline preview.
   */
  children?: ReactNode;
  /**
   * The example thumbnail that pulses while the iframe loads.
   */
  thumbnail?: ReactNode;
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
  browser,
  children,
  thumbnail,
  code,
}: PreviewCardProps) {
  const frame = usePreviewFrame(href);
  return (
    // A card that stretches to its grid row gives the extra height to the
    // window, not to the code below it.
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
          className="grid grid-cols-1 grid-rows-[auto_1fr]"
        >
          <Frame
            $cover
            // Slightly more than the card padding, to suit the rounder corners.
            $p={2}
            className="@container/bar flex items-center gap-2 text-sm"
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
            </ButtonGroup>
          </Frame>
          {inline ? (
            <PreviewCardInline>{children}</PreviewCardInline>
          ) : (
            <PreviewCardViewport
              frame={frame}
              title={title}
              href={href}
              fullscreen={fullscreen}
              thumbnail={thumbnail}
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
  const [history, setHistory] = useState({
    canGoBack: false,
    canGoForward: false,
  });

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

  return { ref, viewportRef, location, loaded, setLoaded, history, send };
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
        <Button aria-label="Reload" onClick={() => send("reload")} $ink={80}>
          <ButtonSlot>
            <RotateCwIcon />
          </ButtonSlot>
        </Button>
      </ButtonGroup>
      <InputGroup
        $rounded="full"
        $border={false}
        // Input surfaces offset away from their parent, which would double the
        // lighten in light mode and cancel it in dark mode.
        $lightnessOffset={false}
        $lighten
        className="min-w-0 flex-1"
      >
        <InputSlot aria-hidden $ink={60}>
          <GlobeIcon />
        </InputSlot>
        <Input
          readOnly
          aria-label="Address"
          value={getAddress(frame.location)}
          className="min-w-0 flex-1"
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
  thumbnail?: ReactNode;
}

function PreviewCardViewport({
  frame,
  title,
  href,
  fullscreen,
  thumbnail,
}: PreviewCardViewportProps) {
  const { ref, viewportRef, loaded, setLoaded } = frame;
  const offscreenWidth = useOffscreenFrameWidth(ref);
  return (
    <PreviewCardStage measuring={offscreenWidth == null}>
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
            data-loading={loaded ? undefined : ""}
            aria-busy={!loaded}
            className="group/preview grid grid-cols-1 *:[grid-area:1/1]"
          >
            <iframe
              ref={ref}
              src={href}
              title={title}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              className={[
                "block w-full border-0 bg-transparent transition-opacity",
                "group-data-loading/preview:opacity-0",
                // Without scripts, nothing reports the load, so the frame shows
                // right away.
                "[@media(scripting:none)]:opacity-100!",
                // The frame would take pointer events from the handle when a
                // drag moves over it.
                resizing ? "pointer-events-none" : "",
              ].join(" ")}
              style={{
                height: fullscreen ? "40rem" : "25rem",
                width: offscreenWidth ?? undefined,
              }}
            />
            {thumbnail && (
              <div
                aria-hidden
                className={[
                  "pointer-events-none hidden place-items-center animate-pulse",
                  "group-data-loading/preview:grid",
                  "[@media(scripting:none)]:hidden!",
                ].join(" ")}
              >
                {thumbnail}
              </div>
            )}
          </div>
        </Frame>
      )}
    </PreviewCardStage>
  );
}

interface PreviewCardInlineProps {
  children?: ReactNode;
}

/** Renders an example directly in the card, without an iframe. */
function PreviewCardInline({ children }: PreviewCardInlineProps) {
  return (
    <PreviewCardStage>
      {({ viewportId }) => (
        <Frame
          id={viewportId}
          $border
          $layer="canvas"
          $p={4}
          className={[
            "grid grid-cols-1 place-items-center content-center overflow-clip",
            // Match the font size of the preview page. It also makes the
            // em-based padding reach the 1rem frame cap, so the example keeps
            // its own corner radius instead of a concentric one.
            "text-base",
            // The global island styles inherit the grid display, which would
            // size the example to its content. Without their boxes, the
            // example is a grid item that fits the card.
            "[&_:is(astro-island,astro-slot,astro-static-slot)]:contents!",
          ].join(" ")}
        >
          {children}
        </Frame>
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
}

/**
 * Holds the preview viewport and the handle that resizes it. The viewport fills
 * the stage until the handle makes it narrower.
 */
function PreviewCardStage({
  children,
  measuring = true,
}: PreviewCardStageProps) {
  const viewportId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const resize = usePreviewResize(stageRef, measuring);
  return (
    <div ref={stageRef} className="grid grid-cols-1">
      <div
        className="relative grid w-full max-w-full grid-cols-1 justify-self-start"
        style={resize.width == null ? undefined : { width: resize.width }}
      >
        {children({ viewportId, resizing: resize.resizing })}
        {resize.enabled && (
          <PreviewCardResizeHandle resize={resize} viewportId={viewportId} />
        )}
      </div>
    </div>
  );
}

/**
 * Returns the width that an offscreen preview frame keeps until it comes near
 * the viewport, or `null` while it follows the card. Each frame lays out a full
 * page, and the browser keeps laying out offscreen frames. Without this, every
 * frame on the page would lay out again on each step of a sidebar animation or
 * a window resize.
 */
function useOffscreenFrameWidth(ref: RefObject<HTMLIFrameElement | null>) {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (!entry) return;
        setWidth(entry.isIntersecting ? null : entry.boundingClientRect.width);
      },
      { rootMargin: OFFSCREEN_MARGIN },
    );
    observer.observe(iframe);
    return () => observer.disconnect();
  }, [ref]);

  return width;
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
        // A card that shares a row in a preview grid keeps its width, even
        // when a narrow grid stacks the cards.
        "[.preview-grid>:not(.col-span-full)_&]:hidden!",
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

/**
 * Scrolls the page around an inactive preview frame with a wheel event that the
 * frame received over one of its own scroll containers.
 */
function scrollPage(iframe: HTMLIFrameElement, message: PreviewScrollMessage) {
  const scrollParent = getScrollParent(iframe);
  if (!scrollParent) return;
  const getDelta = (delta: number, pageSize: number) => {
    if (message.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      return delta * WHEEL_LINE_HEIGHT;
    }
    if (message.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      return delta * pageSize;
    }
    return delta;
  };
  scrollParent.scrollBy({
    left: getDelta(message.deltaX, scrollParent.clientWidth),
    top: getDelta(message.deltaY, scrollParent.clientHeight),
    behavior: "instant",
  });
}
