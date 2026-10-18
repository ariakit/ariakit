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
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  getAppThemeRootValues,
  subscribeAppTheme,
} from "#app/lib/app-theme.ts";
import type {
  PreviewCommandMessage,
  PreviewScrollMessage,
  PreviewThemeMessage,
} from "#app/lib/preview-embed.ts";
import {
  isPreviewFrameMessage,
  PREVIEW_MESSAGE_TYPE,
} from "#app/lib/preview-embed.ts";

// Chrome scrolls about 40 pixels for each line of a line-based wheel event.
const WHEEL_LINE_HEIGHT = 40;

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
    <div className="grid grid-cols-1 gap-2">
      <ak.DisclosureProvider>
        <Frame
          // The 3xl radius matches the macOS browser window corner at the
          // default theme radius.
          $rounded="3xl"
          $forceRounded
          $darken={0.5}
          $orientation="vertical"
          $p={1.5}
          className="grid grid-cols-1"
        >
          <Frame
            $cover
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
          <Frame
            $border
            $layer="canvas"
            $p={inline ? 4 : "none"}
            className="grid grid-cols-1 overflow-clip"
          >
            {inline ? (
              children
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
 * it the site theme and navigation commands.
 */
function usePreviewFrame(href: string) {
  const ref = useRef<HTMLIFrameElement>(null);
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
      if (event.data.loaded) {
        setLoaded(true);
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

  return { ref, location, loaded, setLoaded, history, send };
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
  const { ref, loaded, setLoaded } = frame;
  return (
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
        ].join(" ")}
        style={{ height: fullscreen ? "40rem" : "25rem" }}
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
  );
}

function postToFrame(
  iframe: HTMLIFrameElement,
  message: PreviewCommandMessage | PreviewThemeMessage,
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
