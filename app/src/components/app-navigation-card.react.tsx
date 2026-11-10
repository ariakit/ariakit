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
import type { CarouselButtonProps } from "@ariakit/ui/components/carousel.ariakit.react";
import {
  Carousel,
  CarouselSlide,
  CarouselTab,
  CarouselTabList,
  CarouselViewport,
} from "@ariakit/ui/components/carousel.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { Hovercard } from "@ariakit/ui/components/hovercard.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { TextFrame } from "@ariakit/ui/components/text-frame.ariakit.react";
import { usePerceptibleValue } from "@ariakit/ui/react-utils/use-perceptible-value.react";
import { addGlobalEventListener } from "@ariakit/utils";
import { cx } from "clava";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useEffect, useId, useRef, useState } from "react";
import useLocalStorageState from "use-local-storage-state";
import {
  PreviewLoader,
  usePreviewLoading,
} from "#app/components/preview-loader.react.tsx";
import { subscribeAppTheme } from "#app/lib/app-theme.ts";
import type { AppLink, AppLinkExample } from "#app/lib/app.ts";
import {
  isPreviewFrameMessage,
  PREVIEW_MESSAGE_TYPE,
} from "#app/lib/preview-embed.ts";
import type { PreviewHostMessage } from "#app/lib/preview-frames.ts";
import { postFrameTheme, postToFrame } from "#app/lib/preview-frames.ts";

// Preview pages size their text and spacing in rem and em, so a smaller root
// font size draws the whole example smaller, and more of it fits the card. A
// fullscreen preview lays out a whole page, so it draws smaller still.
const PREVIEW_FONT_SIZE = "75%";
const FULLSCREEN_PREVIEW_FONT_SIZE = "62.5%";

// Small buttons, with their own round corners inside the rounded previews.
const CAROUSEL_BUTTON: CarouselButtonProps = {
  $size: "sm",
  $forceRounded: true,
};

// The card keeps the examples of the last few links that it showed, so a link
// that shows again reuses its loaded previews. The examples of the other links,
// and the whole card while it's hidden, have no layout, so their pages keep
// their state but don't render in the background.
const RECENT_LINK_LIMIT = 3;

// A pointer that passes over the links moves the card along them, so the card
// renders the examples of a link once the pointer rests on it this long.
// Passing a link renders only its title.
const SETTLE_DELAY = 100;

// The size that the person gives the card with its resize grip.
const SIZE_STORAGE_KEY = "app-navigation-card-size";

// Browsers draw the resize grip at the bottom end corner of the box that the
// person resizes, in a square about as wide as a scrollbar.
const RESIZE_GRIP_SIZE = 16;

interface AppNavigationCardSize {
  width: number;
  height: number;
}

export interface AppNavigationCardProps {
  /** The links that open the card, each with its examples. */
  links: AppLink[];
}

/**
 * Renders the card that shows the examples of the link that the mouse pointer
 * rests on, in a carousel, with the title of the example that shows. Render it
 * in the `HovercardProvider` of the links. The card follows the anchor of the
 * store, and the person can resize it, which it remembers.
 */
export function AppNavigationCard({ links }: AppNavigationCardProps) {
  const store = ak.useHovercardContext();
  const mounted = ak.useStoreState(store, "mounted");
  const anchor = ak.useStoreState(store, "anchorElement");
  // The anchor stays on the last link while the card is hidden, so the card
  // reads it only while it shows, and keeps the content as it closes.
  const href = mounted ? anchor?.getAttribute("href") : undefined;
  const link = links.find((link) => link.href === href);
  // Without a default value, the size stays out of the storage until the person
  // resizes the card.
  const [size, setSize, { removeItem: resetSize }] =
    useLocalStorageState<AppNavigationCardSize>(SIZE_STORAGE_KEY);
  // The links that the card keeps, in the order that their examples render,
  // each with the order in which it last showed. Moving a frame in the document
  // loads its page again, so a link that shows again keeps its place.
  const [recentLinks, setRecentLinks] = useState<ReadonlyMap<string, number>>(
    () => new Map(),
  );
  const restingHref = usePerceptibleValue(href, {
    delay: SETTLE_DELAY,
    minDuration: 0,
  });
  const [shownLink, setShownLink] = useState<AppLink>();
  // The card forgets the link that it showed once it hides, so the link that
  // opens it again renders at once. The pointer rested on that link for the
  // show timeout.
  if (!mounted && shownLink) {
    setShownLink(undefined);
  }
  const resting = !shownLink || href === restingHref;
  // The card updates the links that it keeps as it renders for another link, as
  // React does for state that follows a value.
  if (link && resting && link !== shownLink) {
    setShownLink(link);
    setRecentLinks((recent) => getRecentLinks(recent, link.href));
  }
  const recentHrefs = [...recentLinks.keys()];

  // A resize with the grip of the card changes its size between a press and the
  // release that follows. The card keeps that size from then on.
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget;
    const { offsetWidth: width, offsetHeight: height } = box;
    // Chrome and Safari send a release over a preview to the page in its frame,
    // so the card listens in the same-origin frames too.
    const removeListener = addGlobalEventListener("pointerup", () => {
      removeListener();
      // A cross-origin frame keeps its release, so a later release can come
      // after the card hides, when the box has no layout to keep.
      if (!box.offsetWidth) return;
      if (box.offsetWidth === width && box.offsetHeight === height) return;
      setSize({ width: box.offsetWidth, height: box.offsetHeight });
    });
  };

  // A double click on the resize grip gives the card its default size again.
  const onDoubleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.right - RESIZE_GRIP_SIZE) return;
    if (event.clientY < rect.bottom - RESIZE_GRIP_SIZE) return;
    resetSize();
  };

  return (
    <Hovercard
      portal
      fixed
      $slide
      $p={1}
      // The links sit the navigation padding inside the sidebar edge, so twice
      // that padding puts the card as far outside it.
      gutter={anchor ? getNavigationPadding(anchor) * 2 : undefined}
    >
      {/* The person can resize the card with the grip at the corner of this
          box. A resizable box clips its content, so the box has no rounded
          corners: inside another rounded clip, Chrome can skip the rounded
          clip of the frame around a preview when it draws with the GPU, and
          the preview covers the corners of the frame. */}
      <div
        onPointerDown={onPointerDown}
        onDoubleClick={onDoubleClick}
        style={
          isCardSize(size)
            ? { width: size.width, height: size.height }
            : undefined
        }
        className={cx(
          "grid grid-rows-[minmax(0,1fr)]",
          // WebKit ignores the grip while the content covers it, as the slide
          // tabs or a preview do, unless the box is a stacking context.
          "resize overflow-hidden isolate",
          "h-[23rem] w-[30rem] min-h-64 min-w-80",
          "max-h-[calc(100dvh-2rem)] max-w-[min(60rem,calc(100vw-2rem))]",
        )}
      >
        {recentHrefs.map((recentHref) => {
          const recentLink = links.find((link) => link.href === recentHref);
          if (!recentLink?.examples) return null;
          return (
            <AppNavigationExamples
              key={recentHref}
              label={recentLink.label}
              examples={recentLink.examples}
              current={recentHref === link?.href}
            />
          );
        })}
        {/* A link that the card doesn't keep shows its title until the pointer
            rests on it. A link that it keeps shows its examples at once. */}
        {link?.examples && !recentLinks.has(link.href) && (
          <AppNavigationPlaceholder examples={link.examples} />
        )}
      </div>
    </Hovercard>
  );
}

/**
 * Returns the links that the card keeps after the given link shows: the link
 * moves to the end of the order in which the links showed, without moving in
 * the map, and the link that showed least recently goes once there are too
 * many.
 */
function getRecentLinks(recent: ReadonlyMap<string, number>, href: string) {
  const last = Math.max(0, ...recent.values());
  const next = new Map(recent).set(href, last + 1);
  if (next.size <= RECENT_LINK_LIMIT) {
    return next;
  }
  const [oldest] = [...next].sort(([, a], [, b]) => a - b);
  if (oldest) {
    next.delete(oldest[0]);
  }
  return next;
}

/** Whether a stored value is a card size, since storage can hold anything. */
function isCardSize(value: unknown): value is AppNavigationCardSize {
  if (!value) return false;
  if (typeof value !== "object") return false;
  if (!("width" in value)) return false;
  if (typeof value.width !== "number") return false;
  if (!("height" in value)) return false;
  if (typeof value.height !== "number") return false;
  return true;
}

/** Returns the padding of the navigation around its links, in pixels. */
function getNavigationPadding(link: Element) {
  // The navigation registers the padding as a length, so it computes to pixels.
  const padding = getComputedStyle(link).getPropertyValue("--nav-py");
  return Number.parseFloat(padding) || 0;
}

interface AppNavigationExamplesProps {
  label: string;
  examples: AppLinkExample[];
  /** Whether the examples show, for the link of the card. */
  current: boolean;
}

function AppNavigationExamples({
  label,
  examples,
  current,
}: AppNavigationExamplesProps) {
  const baseId = useId();
  const getSlideId = (index: number) => `${baseId}-${index}`;
  const [selectedId, setSelectedId] = useState(() => getSlideId(0));
  // A slide loads its preview page once it's the selected slide, and keeps it,
  // so the card loads only the examples that people look at.
  const [shownIds, setShownIds] = useState<ReadonlySet<string>>(
    () => new Set([getSlideId(0)]),
  );
  const select = (id: string) => {
    setSelectedId(id);
    setShownIds((ids) => {
      if (ids.has(id)) {
        return ids;
      }
      return new Set(ids).add(id);
    });
  };
  const selected = examples.find(
    (_example, index) => getSlideId(index) === selectedId,
  );
  const [onlyExample] = examples;
  return (
    <div
      hidden={!current}
      className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)]"
    >
      {/* Only the examples that show name the card. */}
      {current && selected && <AppNavigationTitle example={selected} />}
      {onlyExample && examples.length === 1 ? (
        // A single example has nowhere to move, so it shows without the
        // carousel and its controls.
        <AppNavigationFrame className="min-h-0 overflow-clip">
          <AppNavigationPreview example={onlyExample} />
        </AppNavigationFrame>
      ) : (
        <Carousel
          aria-label={`${label} examples`}
          setSelectedId={select}
          // The buttons lie over the ends of the previews, so they stay small.
          $buttonSize={6}
          previousButton={CAROUSEL_BUTTON}
          nextButton={CAROUSEL_BUTTON}
          className={cx(
            // The previews fill the height of the card above the slide tabs.
            "min-h-0 grid-rows-[minmax(0,1fr)_auto]",
            // The slide tabs keep the padding of the card from the previews, as
            // from the edge of the card below them.
            "gap-y-1",
          )}
        >
          {/* The viewport clips the slides to its corners, so the corners stay
              in place while the slides scroll past them. */}
          <CarouselViewport $gap={0} render={<AppNavigationFrame />}>
            {examples.map((example, index) => {
              const id = getSlideId(index);
              return (
                <CarouselSlide key={example.href} id={id}>
                  {shownIds.has(id) && (
                    <AppNavigationPreview example={example} />
                  )}
                </CarouselSlide>
              );
            })}
          </CarouselViewport>
          <CarouselTabList>
            {examples.map((example) => (
              <CarouselTab key={example.href} />
            ))}
          </CarouselTabList>
        </Carousel>
      )}
    </div>
  );
}

interface AppNavigationPlaceholderProps {
  examples: AppLinkExample[];
}

// The title of the first example of a link over an empty frame, laid out as the
// examples of the link before their pages load, with the room of the slide tabs
// below a carousel.
function AppNavigationPlaceholder({ examples }: AppNavigationPlaceholderProps) {
  const [first] = examples;
  return (
    <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)]">
      {first && <AppNavigationTitle example={first} />}
      {examples.length === 1 ? (
        <AppNavigationFrame className="min-h-0 overflow-clip" />
      ) : (
        <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-y-1">
          <AppNavigationFrame />
          <div className="h-6" />
        </div>
      )}
    </div>
  );
}

interface AppNavigationTitleProps {
  example: AppLinkExample;
}

// The title of the example that shows, which names the card. It links to the
// example in the gallery of its page, as a prose heading links to itself.
function AppNavigationTitle({ example }: AppNavigationTitleProps) {
  return (
    <TextFrame
      $p={2}
      render={<Heading render={<ak.HovercardHeading />} className="text-sm" />}
    >
      <Link href={example.href}>{example.title}</Link>
    </TextFrame>
  );
}

// The frame around the previews. It draws a border, which the previews sit
// inside, and the canvas of the preview pages shows while they load. The pages
// find it to round their app shells to its corners.
function AppNavigationFrame(props: ak.RoleProps<"div">) {
  return (
    <Frame
      data-app-navigation-frame
      $border
      $borderType="border"
      $layer="canvas"
      $p="none"
      {...props}
    />
  );
}

interface AppNavigationPreviewProps {
  example: AppLinkExample;
}

function AppNavigationPreview({ example }: AppNavigationPreviewProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  // The page shows once the loader goes away.
  const loading = usePreviewLoading(!ready);
  const fontSize = example.fullscreen
    ? FULLSCREEN_PREVIEW_FONT_SIZE
    : PREVIEW_FONT_SIZE;

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    const post = (message: PreviewHostMessage) => postToFrame(iframe, message);
    // The frame around the page clips it to its corners, as in a preview card.
    const postTheme = () =>
      postFrameTheme(iframe, iframe.closest("[data-app-navigation-frame]"));
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      if (!isPreviewFrameMessage(event.data)) return;
      // A page drops its activation when it loses focus, and the docs page
      // behind the card would then take the wheel. So the card activates it
      // again.
      if (event.data.action === "active") {
        if (event.data.active) return;
        post({ type: PREVIEW_MESSAGE_TYPE, action: "activate" });
        return;
      }
      if (event.data.action !== "location") return;
      // Each new document in the frame reports its location while it parses, so
      // it gets the theme and its compact layout before it renders. A new
      // document is inactive, and activating it lets the person scroll it with
      // the wheel. It still can't move focus by itself, so it can't take focus
      // from the page.
      postTheme();
      post({ type: PREVIEW_MESSAGE_TYPE, action: "compact", fontSize });
      post({ type: PREVIEW_MESSAGE_TYPE, action: "activate" });
      // A page can open its popup after the frame loads, so the frame waits for
      // both, as a preview card does. A new document in the frame is not ready
      // until it loads too.
      setReady(event.data.loaded && !event.data.opening);
    };
    window.addEventListener("message", onMessage);
    const unsubscribeTheme = subscribeAppTheme(postTheme);
    // The page may have reported its location before this listener, so ask for
    // it again.
    post({ type: PREVIEW_MESSAGE_TYPE, action: "sync" });
    return () => {
      window.removeEventListener("message", onMessage);
      unsubscribeTheme();
    };
  }, [fontSize]);

  return (
    // The loader lies over the frame in the same grid cell until the page is
    // ready.
    <div className="grid size-full *:col-start-1 *:row-start-1">
      <iframe
        ref={ref}
        src={example.previewHref}
        title={example.title}
        // The page shows once it's ready, so it doesn't flash its first paint.
        className={cx(
          "block size-full transition-opacity duration-200 motion-reduce:transition-none",
          (!ready || loading) && "opacity-0",
        )}
      />
      {loading && (
        <div
          aria-hidden
          className="pointer-events-none grid place-items-center"
        >
          <PreviewLoader />
        </div>
      )}
    </div>
  );
}
