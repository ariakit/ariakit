import * as ak from "@ariakit/react";
import {
  useEvent,
  useMergeRefs,
  useSafeLayoutEffect,
} from "@ariakit/react-utils";
import { getDocument, getWindow } from "@ariakit/utils";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import {
  appendOptionalChild,
  createOptionalRender,
  createRender,
} from "../react-utils/create-render.react.ts";
import {
  LandmarkContext,
  useNestedLandmarks,
} from "../react-utils/landmark.react.ts";
import {
  toc,
  tocItem,
  tocLabel,
  tocLink,
  tocLinkGuide,
  tocLinkMarker,
  tocLinkThumb,
  tocList,
} from "../styles/toc.ts";

// The end of the page slides the activation line to this distance above the
// bottom of the scroll container, so the last heading can still pass it.
const END_LINE_INSET = 4;
// The space kept around the current link when a long list scrolls to it.
const SCROLL_MARGIN = 12;

// Refs, not elements, so pieces that remount without registering again stay
// current.
interface TocEntry {
  href?: string;
  link: React.RefObject<HTMLElement | null>;
  thumb: React.RefObject<HTMLElement | null>;
  marker: React.RefObject<HTMLElement | null>;
}

interface TocRegistry {
  register: (id: string, entry: TocEntry) => () => void;
}

interface TocLevel {
  /** How many lists hold the link. Top-level links are in one list. */
  depth: number;
  ordered: boolean;
  /** Whether a `TocItem` already renders the list item around the link. */
  item: boolean;
}

const TocRegistryContext = React.createContext<TocRegistry | null>(null);
const TocCurrentContext = React.createContext<string | null>(null);
const TocLevelContext = React.createContext<TocLevel>({
  depth: 0,
  ordered: false,
  item: false,
});

interface TocSection {
  top: number;
  // Where a link click puts the heading: the scroll padding of the scroll
  // container plus the scroll margin of the heading.
  base: number;
  // The base line, slid down near the end of the page.
  line: number;
  // Whether the URL hash points to the heading.
  hashed: boolean;
}

interface TocSpyState {
  current: number;
  first: number;
  last: number;
}

interface TocRow {
  top: number;
  bottom: number;
}

// Returns the element that a link's hash points to, if any.
function getTarget(doc: Document, href?: string) {
  if (!href) return null;
  const index = href.indexOf("#");
  if (index === -1) return null;
  let id = href.slice(index + 1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // Keep a malformed hash as written, like the browser does.
  }
  if (!id) return null;
  return doc.getElementById(id);
}

function isVisible(element: Element) {
  return element.getClientRects().length > 0;
}

// Hidden content can keep its boxes, such as closed details, or a panel that
// collapses with a transition and hides with the visibility property.
function isTargetVisible(target: Element) {
  if (typeof target.checkVisibility === "function") {
    return target.checkVisibility({ visibilityProperty: true });
  }
  if (!isVisible(target)) return false;
  return getWindow(target).getComputedStyle(target).visibility === "visible";
}

// Event targets can come from another realm, so this checks the node type
// instead of the Element constructor.
function isElementNode(target: EventTarget | null): target is Element {
  if (!target) return false;
  if (!("nodeType" in target)) return false;
  return target.nodeType === 1;
}

function isScrollContainer(element: Element) {
  const { overflowY } = getWindow(element).getComputedStyle(element);
  if (!/auto|scroll|overlay/.test(overflowY)) return false;
  // A container that clips another axis also computes a scrollable value here,
  // but only one with overflowing content moves its headings.
  return element.scrollHeight > element.clientHeight + 1;
}

// The body scrolls on its own only when the root element clips its overflow.
// Otherwise, the overflow of the body moves to the viewport, which is the page.
function isBodyScrollContainer(doc: Document) {
  const root = doc.documentElement;
  const style = getWindow(root).getComputedStyle(root);
  if (style.overflowX === "visible" && style.overflowY === "visible") {
    return false;
  }
  return isScrollContainer(doc.body);
}

// Returns the nearest scroll container around the element, or null for the
// page.
function getScrollContainer(element: Element) {
  const doc = getDocument(element);
  let parent = element.parentElement;
  while (parent && parent !== doc.documentElement) {
    if (parent === doc.body) {
      return isBodyScrollContainer(doc) ? parent : null;
    }
    if (isScrollContainer(parent)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

// Resolves a computed scroll padding, which keeps percentages as written, so
// they resolve against the height of the scroll container here. A length is in
// the CSS pixels of its element, which the zoom converts.
function getScrollPadding(value: string, height: number, zoom = 1) {
  if (value.endsWith("%")) {
    return (Number.parseFloat(value) / 100) * height;
  }
  return (Number.parseFloat(value) || 0) * zoom;
}

interface GetSectionsParams {
  doc: Document;
  entries: TocEntry[];
  container: HTMLElement | null;
}

// Measures the headings of the links relative to the top of the scroll
// container. Missing, hidden, and repeated targets have no section.
function getSections({ doc, entries, container }: GetSectionsParams) {
  const win = getWindow(doc);
  const scroller = container ?? doc.scrollingElement ?? doc.documentElement;
  // Rects are in viewport pixels, like the scroll lengths of the page. An
  // element scrolls in its own CSS pixels, which its CSS zoom scales.
  const zoom = container?.currentCSSZoom || 1;
  const viewTop = container
    ? container.getBoundingClientRect().top + container.clientTop * zoom
    : 0;
  const height = container
    ? container.clientHeight
    : doc.documentElement.clientHeight;
  const { scrollTop, scrollHeight, clientHeight } = scroller;
  const maxScroll = scrollHeight - clientHeight;
  const remaining = maxScroll - scrollTop;
  const style = win.getComputedStyle(container ?? doc.documentElement);
  // The scroll padding of the root is in its own CSS pixels, which a zoom on
  // the root scales to the viewport pixels of the page.
  const paddingZoom = container ? 1 : doc.documentElement.currentCSSZoom || 1;
  const padding = getScrollPadding(style.scrollPaddingTop, height, paddingZoom);
  const hashTarget = getTarget(doc, win.location.hash);
  const seen = new Set<Element>();
  const sections = entries.map((entry): TocSection | null => {
    const target = getTarget(doc, entry.href);
    if (!target) return null;
    if (seen.has(target)) return null;
    seen.add(target);
    if (!isTargetVisible(target)) return null;
    const top = (target.getBoundingClientRect().top - viewTop) / zoom;
    // The scroll margin is in the CSS pixels of the heading, which can zoom
    // more than the scroll container, such as in a zoomed page.
    const targetZoom = (target.currentCSSZoom || 1) / zoom;
    const { scrollMarginTop } = win.getComputedStyle(target);
    const margin = Number.parseFloat(scrollMarginTop) || 0;
    const base = padding + margin * targetZoom;
    const hashed = target === hashTarget;
    if (maxScroll <= 0) {
      return { top, base, line: base, hashed };
    }
    // Over the last screen of scrolling, the line slides down to the bottom, so
    // short final sections become current in turn.
    const range = Math.max(1, Math.min(height - base, maxScroll));
    const progress = Math.min(1, Math.max(0, 1 - remaining / range));
    const line = base + (height - END_LINE_INSET - base) * progress;
    return { top, base, line, hashed };
  });
  // The last section ends at the end of the scrollable content.
  const contentEnd = scrollHeight - scrollTop;
  return { sections, contentEnd, height };
}

interface GetSpyStateParams {
  sections: (TocSection | null)[];
  contentEnd: number;
  height: number;
}

function getSpyState({ sections, contentEnd, height }: GetSpyStateParams) {
  const state: TocSpyState = { current: -1, first: -1, last: -1 };
  let passed = false;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (!section) continue;
    // The current item is the last heading above its activation line, with one
    // pixel of tolerance for subpixel scroll positions. Headings side by side,
    // such as titles of cards in a grid row, pass the line together. The first
    // one stays current, unless a link scrolled to another one.
    if (!passed && section.top <= section.line + 1) {
      const current = sections[state.current];
      const sameRow = current && Math.abs(section.top - current.top) <= 1;
      if (!sameRow || section.hashed) {
        state.current = i;
      }
    } else {
      passed = true;
    }
    // A section runs to the next heading in the list, skipping the headings
    // beside it in the same row. Any part of it between the base line and the
    // bottom makes it visible.
    let bottom = contentEnd;
    for (let j = i + 1; j < sections.length; j++) {
      const next = sections[j];
      if (!next) continue;
      if (Math.abs(next.top - section.top) <= 1) continue;
      bottom = next.top;
      break;
    }
    const amount =
      Math.min(bottom, height) - Math.max(section.top, section.base);
    if (amount > 0.5) {
      if (state.first === -1) {
        state.first = i;
      }
      state.last = i;
    }
  }
  return state;
}

function isSameSpyState(a: TocSpyState, b: TocSpyState) {
  if (a.current !== b.current) return false;
  if (a.first !== b.first) return false;
  return a.last === b.last;
}

// Returns the nearest scroll container that holds the element but not the
// headings, so scrolling it never moves the page.
function getOwnScrollBox(element: HTMLElement, headings: Element | null) {
  const doc = getDocument(element);
  let box: HTMLElement | null = element;
  while (box && box !== doc.body && box !== doc.documentElement) {
    if (headings && box.contains(headings)) return null;
    if (isScrollContainer(box)) {
      return box;
    }
    box = box.parentElement;
  }
  return null;
}

interface KeepInViewParams {
  box: HTMLElement;
  /** The current link, which stays in view. */
  link: HTMLElement;
  /** The element whose top comes into view, such as the label. */
  start: Element;
  /** The last row to bring into view, such as the last section on screen. */
  end: Element;
}

// Scrolls only the box of a long list so the rows from the start element to the
// end element stay in view. When they don't fit, the current link wins.
// Scrolling the link into view could also scroll the page and cancel its smooth
// scrolling. The scroll padding of the box, such as room for a sticky label,
// widens the space kept around the rows.
function keepInView({ box, link, start, end }: KeepInViewParams) {
  if (!isVisible(link)) return;
  const win = getWindow(box);
  const style = win.getComputedStyle(box);
  const height = box.clientHeight;
  const marginTop = Math.max(
    SCROLL_MARGIN,
    getScrollPadding(style.scrollPaddingTop, height),
  );
  const marginBottom = Math.max(
    SCROLL_MARGIN,
    getScrollPadding(style.scrollPaddingBottom, height),
  );
  // Rects include the CSS zoom of the box, unlike its scroll position and
  // lengths, so row positions divide by it.
  const zoom = box.currentCSSZoom || 1;
  const boxTop = box.getBoundingClientRect().top + box.clientTop * zoom;
  const linkRect = link.getBoundingClientRect();
  // A sticky start element stays at the top of the box, so the link can be
  // above it.
  const startTop = Math.min(start.getBoundingClientRect().top, linkRect.top);
  const endBottom = Math.max(
    end.getBoundingClientRect().bottom,
    linkRect.bottom,
  );
  const top = (startTop - boxTop) / zoom;
  const bottom = (endBottom - boxTop) / zoom;
  let delta = 0;
  if (top < marginTop) {
    delta = top - marginTop;
  } else if (bottom > height - marginBottom) {
    // The end comes into view only as far as the start stays in view.
    delta = Math.min(top - marginTop, bottom - height + marginBottom);
  }
  if (!delta) return;
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  box.scrollTo({
    top: box.scrollTop + delta,
    behavior: reduced ? "instant" : "smooth",
  });
}

function sortEntries(entries: Map<string, TocEntry>) {
  return [...entries].sort(([, a], [, b]) => {
    const linkA = a.link.current;
    const linkB = b.link.current;
    if (!linkA) return 0;
    if (!linkB) return 0;
    const position = linkA.compareDocumentPosition(linkB);
    return position & linkA.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
}

interface UseTocSpyParams {
  rootRef: React.RefObject<HTMLElement | null>;
  onCurrentChange?: (href: string | null) => void;
}

// Keeps the current link in React state and the thumb range in the inline
// styles of the root, so scrolling re-renders only when the current link
// changes.
function useTocSpy({ rootRef, onCurrentChange }: UseTocSpyParams) {
  const [currentId, setCurrentId] = React.useState<string | null>(null);
  // Links that register again restart the effect, which must not report the
  // same current link twice.
  const currentIdRef = React.useRef<string | null>(null);
  const entriesRef = React.useRef(new Map<string, TocEntry>());
  const [version, setVersion] = React.useState(0);

  const registry = React.useMemo<TocRegistry>(
    () => ({
      register: (id, entry) => {
        entriesRef.current.set(id, entry);
        setVersion((value) => value + 1);
        return () => {
          entriesRef.current.delete(id);
          setVersion((value) => value + 1);
        };
      },
    }),
    [],
  );

  const onChange = useEvent(onCurrentChange);

  useSafeLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const doc = getDocument(root);
    const win = getWindow(root);
    const sorted = sortEntries(entriesRef.current);
    const entries = sorted.map(([, entry]) => entry);
    const ids = sorted.map(([id]) => id);
    let rows: (TocRow | null)[] = [];
    let state: TocSpyState | null = null;
    let container: HTMLElement | null = null;
    let headings: Element | null = null;
    let frame = 0;
    let ready = false;

    // Finds the scroll container of the first heading again and tells whether
    // it changed.
    const updateContainer = () => {
      const previous = container;
      headings = null;
      for (const entry of entries) {
        headings = getTarget(doc, entry.href);
        if (headings) break;
      }
      container = headings ? getScrollContainer(headings) : null;
      return container !== previous;
    };

    // Measures each piece relative to the content of the root, which stays the
    // same while the page or the root scrolls.
    const measure = () => {
      // Rects include the CSS zoom of the root, unlike the lengths the pieces
      // compare in CSS.
      const zoom = root.currentCSSZoom || 1;
      const rootRect = root.getBoundingClientRect();
      const originTop = rootRect.top + (root.clientTop - root.scrollTop) * zoom;
      const getOffset = (y: number) => (y - originTop) / zoom;
      rows = entries.map((entry) => {
        const link = entry.link.current;
        const thumb = entry.thumb.current;
        const marker = entry.marker.current;
        if (marker && isVisible(marker)) {
          const top = getOffset(marker.getBoundingClientRect().top);
          marker.style.setProperty("--toc-piece-top", `${top}px`);
        }
        if (!link) return null;
        if (!thumb) return null;
        if (!isVisible(thumb)) return null;
        const linkRect = link.getBoundingClientRect();
        const thumbRect = thumb.getBoundingClientRect();
        const thumbTop = getOffset(thumbRect.top);
        thumb.style.setProperty("--toc-piece-top", `${thumbTop}px`);
        // A piece ends this far from the row edges, so the thumb covers the
        // line along the visible rows and the bends between them.
        const joint = linkRect.bottom - thumbRect.bottom;
        return {
          top: getOffset(linkRect.top + joint),
          bottom: getOffset(thumbRect.bottom),
        };
      });
    };

    const getRange = () => {
      if (!state) return null;
      const firstRow = rows.find((row) => row != null);
      if (!firstRow) return null;
      // With no section on screen, the empty range waits at the first row.
      if (state.first === -1) {
        return { start: firstRow.top, end: firstRow.top };
      }
      const start = rows[state.first]?.top ?? firstRow.top;
      const end = rows[state.last]?.bottom ?? start;
      return { start, end };
    };

    const applyRange = () => {
      const range = getRange();
      // A hidden table of contents has no range. When it shows again, its first
      // range appears at once, like the first one after hydration.
      if (!range) {
        ready = false;
        return;
      }
      const setRange = () => {
        root.style.setProperty("--toc-thumb-start", `${range.start}px`);
        root.style.setProperty("--toc-thumb-end", `${range.end}px`);
      };
      if (ready) {
        setRange();
        return;
      }
      ready = true;
      // Reading the style applies the range before the transition turns back
      // on, so only later ranges glide.
      const { transitionDuration } = root.style;
      root.style.transitionDuration = "0s";
      setRange();
      win.getComputedStyle(root).getPropertyValue("--toc-thumb-start");
      root.style.transitionDuration = transitionDuration;
    };

    // Keeps the rows of the sections on screen in view in a list that scrolls
    // by itself. Before the first section, the list shows its start, as at the
    // first link, which also brings the label above it into view.
    const keepRangeInView = (spy: TocSpyState) => {
      // Without headings, no box is known to leave the page alone.
      if (!headings) return;
      const index = Math.max(spy.current, 0);
      const link = entries[index]?.link.current;
      if (!link) return;
      // The box can be the list around the link, the root, or an element around
      // the root.
      const box = getOwnScrollBox(link, headings);
      if (!box) return;
      const start = index === 0 ? root.firstElementChild : null;
      const end = entries[spy.last]?.link.current;
      keepInView({ box, link, start: start ?? link, end: end ?? link });
    };

    const update = () => {
      const result = getSections({ doc, entries, container });
      const next = getSpyState(result);
      if (state && isSameSpyState(state, next)) return;
      state = next;
      applyRange();
      keepRangeInView(next);
      const id = ids[next.current] ?? null;
      if (id === currentIdRef.current) return;
      currentIdRef.current = id;
      setCurrentId(id);
      onChange(entries[next.current]?.href ?? null);
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = win.requestAnimationFrame(() => {
        frame = 0;
        observeContent();
        update();
      });
    };

    // Content that loads or wraps moves the headings without a scroll. It can
    // also make an element around them overflow, which turns that element into
    // their scroll container.
    const contentObserver = new win.ResizeObserver(() => {
      if (updateContainer()) {
        refresh();
        return;
      }
      scheduleUpdate();
    });

    let observedScroller: Element | null = null;
    let observedParent: Element | null = null;

    // Observing an element from a resize callback reports a resize loop error,
    // so callbacks leave this to the next frame.
    const observeContent = () => {
      // The box of a scroll container keeps its size while its content grows,
      // so its children and the parent of the headings report the growth.
      const scroller = container ?? doc.body;
      const parent = headings?.parentElement ?? null;
      if (scroller === observedScroller && parent === observedParent) return;
      observedScroller = scroller;
      observedParent = parent;
      contentObserver.disconnect();
      contentObserver.observe(scroller);
      for (const child of scroller.children) {
        contentObserver.observe(child);
      }
      if (parent) {
        contentObserver.observe(parent);
      }
    };

    // A hidden table of contents or hidden headings, such as in a closed
    // dialog, have no scroll container until they show, which resizes them. The
    // state applies again, so a table of contents that shows also brings its
    // rows into view.
    const refresh = () => {
      updateContainer();
      measure();
      state = null;
      update();
      scheduleUpdate();
    };

    refresh();

    const observer = new win.ResizeObserver(refresh);
    observer.observe(root);
    const lists = new Set<Element>();
    for (const entry of entries) {
      const link = entry.link.current;
      if (!link) continue;
      observer.observe(link);
      const list = link.parentElement?.parentElement;
      if (list) {
        lists.add(list);
      }
    }
    for (const list of lists) {
      observer.observe(list);
    }

    // A popover or dialog can scale the table of contents and its headings
    // while it opens, and a transform doesn't resize them, so the pieces and
    // the sections are measured again when an animation around the root ends.
    // The corrected range appears at once.
    const onAnimationEnd = (event: Event) => {
      const { target } = event;
      if (target === root) return;
      if (!isElementNode(target)) return;
      if (!target.contains(root)) return;
      ready = false;
      refresh();
    };

    // Scroll events don't bubble, so a capturing listener on the document hears
    // the page and any scroll container.
    doc.addEventListener("scroll", scheduleUpdate, {
      capture: true,
      passive: true,
    });
    doc.addEventListener("transitionend", onAnimationEnd, true);
    doc.addEventListener("animationend", onAnimationEnd, true);
    win.addEventListener("resize", scheduleUpdate);
    win.addEventListener("hashchange", scheduleUpdate);
    // Late fonts resize the rows, which the observer measures again, and can
    // wrap labels without a resize of the list.
    void doc.fonts?.ready.then(() => {
      if (!root.isConnected) return;
      measure();
      applyRange();
    });

    return () => {
      win.cancelAnimationFrame(frame);
      observer.disconnect();
      contentObserver.disconnect();
      doc.removeEventListener("scroll", scheduleUpdate, { capture: true });
      doc.removeEventListener("transitionend", onAnimationEnd, true);
      doc.removeEventListener("animationend", onAnimationEnd, true);
      win.removeEventListener("resize", scheduleUpdate);
      win.removeEventListener("hashchange", scheduleUpdate);
    };
  }, [rootRef, version, onChange]);

  return { registry, currentId };
}

export interface TocProps
  extends ak.RoleProps<"nav">, Omit<VariantProps<typeof toc>, "$ordered"> {
  /**
   * A visible title above the rows, as content or `TocLabel` props. It names
   * the landmark unless `aria-label` or `aria-labelledby` is set.
   */
  label?: React.ReactNode | TocLabelProps;
  /**
   * The list that holds the rows, as an element or `TocList` props. Defaults to
   * a `TocList` containing the children, or an ordered one with `ordered`. Set
   * `false` to render the root list in the children.
   */
  list?: React.ReactElement | TocListProps | false;
  /**
   * Whether the table of contents renders a `nav` landmark. When omitted, it
   * does unless an ancestor `Nav` or a `ShellSidebar` with `landmark="nav"`
   * already renders one, in which case it renders a `div`. A name from `label`,
   * `aria-label`, or `aria-labelledby` keeps the landmark. Set `false` where
   * that ancestor is outside this React tree, such as in an Astro island.
   */
  landmark?: boolean;
  /**
   * Renders the root list as an `ol` and numbers its top-level rows with
   * markers on the guide. Nested lists stay unnumbered.
   */
  ordered?: boolean;
  /**
   * Called with the `href` of the new current link, or `null` when no heading
   * has reached the activation line yet.
   */
  onCurrentChange?: (href: string | null) => void;
}

/**
 * A table of contents for the headings of a page. Its links stay native, and
 * the link of the section being read gets `aria-current="location"`: the last
 * heading above the activation line, which is the scroll padding of the scroll
 * container plus the scroll margin of the heading. A thumb on the guide covers
 * the rows whose sections are on screen. The scroll container is the nearest
 * one around the first heading, or the page.
 * @example
 * <Toc label="On this page">
 *   <TocLink href="#overview">Overview</TocLink>
 *   <TocItem>
 *     <TocLink href="#usage">Usage</TocLink>
 *     <TocList>
 *       <TocLink href="#basic">Basic example</TocLink>
 *     </TocList>
 *   </TocItem>
 * </Toc>
 * @example
 * <Toc label="Chapters" ordered>
 *   <TocLink href="#basics">Basics</TocLink>
 *   <TocLink href="#data">Working with data</TocLink>
 * </Toc>
 */
export function Toc({
  label,
  list,
  landmark,
  ordered,
  onCurrentChange,
  children,
  ...props
}: TocProps) {
  const [variantProps, rest] = splitProps(props, toc);
  const rootRef = React.useRef<HTMLElement>(null);
  const ref = useMergeRefs(rootRef, rest.ref);
  const { registry, currentId } = useTocSpy({
    rootRef,
    onCurrentChange,
  });
  const defaultLabelId = React.useId();
  const labelElement = createOptionalRender(TocLabel, label, {
    id: defaultLabelId,
  });
  const labelId: string | undefined = labelElement?.props.id;
  const landmarks = React.useContext(LandmarkContext);
  const named =
    rest["aria-label"] != null ||
    rest["aria-labelledby"] != null ||
    labelElement != null;
  const isLandmark = landmark ?? (!landmarks.navigation || named);
  const nestedLandmarks = useNestedLandmarks(landmarks, {
    navigation: isLandmark,
  });
  const level = React.useMemo(
    () => ({ depth: 0, ordered: !!ordered, item: false }),
    [ordered],
  );
  return (
    <LandmarkContext.Provider value={nestedLandmarks}>
      <TocRegistryContext.Provider value={registry}>
        <TocCurrentContext.Provider value={currentId}>
          <TocLevelContext.Provider value={level}>
            <ak.Role.nav
              // A render prop from the caller still decides the element.
              render={isLandmark ? undefined : <div />}
              aria-labelledby={
                isLandmark && rest["aria-label"] == null ? labelId : undefined
              }
              {...toc.jsx({ ...variantProps, $ordered: !!ordered })}
              {...rest}
              ref={ref}
            >
              {labelElement}
              {list === false
                ? children
                : createRender(TocList, list, {
                    children,
                    render: ordered ? <ol /> : undefined,
                  })}
            </ak.Role.nav>
          </TocLevelContext.Provider>
        </TocCurrentContext.Provider>
      </TocRegistryContext.Provider>
    </LandmarkContext.Provider>
  );
}

export interface TocLabelProps
  extends ak.RoleProps<"div">, VariantProps<typeof tocLabel> {}

/**
 * The visible title of a `Toc`, lined up with the text of the top-level rows.
 * The `label` prop of `Toc` creates one and names the landmark with it.
 * @example
 * <Toc label={<TocLabel $uppercase>On this page</TocLabel>}>
 *   <TocLink href="#overview">Overview</TocLink>
 * </Toc>
 */
export function TocLabel(props: TocLabelProps) {
  const [variantProps, rest] = splitProps(props, tocLabel);
  return <ak.Role.div {...tocLabel.jsx(variantProps)} {...rest} />;
}

export interface TocListProps
  extends ak.RoleProps<"ul">, VariantProps<typeof tocList> {}

/**
 * A list of table of contents rows. Put one in a `TocItem` for nested rows.
 * `Toc` creates the root list. Render an `ol` with `render={<ol />}`.
 * @example
 * <Toc label="On this page">
 *   <TocItem>
 *     <TocLink href="#usage">Usage</TocLink>
 *     <TocList>
 *       <TocLink href="#basic">Basic example</TocLink>
 *     </TocList>
 *   </TocItem>
 * </Toc>
 */
export function TocList(props: TocListProps) {
  const [variantProps, rest] = splitProps(props, tocList);
  const level = React.useContext(TocLevelContext);
  // Links in a new level render their own list items again.
  const nestedLevel = React.useMemo(
    () => ({ ...level, depth: level.depth + 1, item: false }),
    [level],
  );
  return (
    <TocLevelContext.Provider value={nestedLevel}>
      <ak.Role.ul {...tocList.jsx(variantProps)} {...rest} />
    </TocLevelContext.Provider>
  );
}

export interface TocItemProps
  extends ak.RoleProps<"li">, VariantProps<typeof tocItem> {}

/**
 * A list item that holds a `TocLink` and the `TocList` of its nested rows. The
 * link inside renders without its own list item.
 * @example
 * <Toc label="On this page">
 *   <TocItem>
 *     <TocLink href="#usage">Usage</TocLink>
 *     <TocList>
 *       <TocLink href="#basic">Basic example</TocLink>
 *     </TocList>
 *   </TocItem>
 * </Toc>
 */
export function TocItem(props: TocItemProps) {
  const [variantProps, rest] = splitProps(props, tocItem);
  const level = React.useContext(TocLevelContext);
  const itemLevel = React.useMemo(() => ({ ...level, item: true }), [level]);
  return (
    <TocLevelContext.Provider value={itemLevel}>
      <ak.Role.li {...tocItem.jsx(variantProps)} {...rest} />
    </TocLevelContext.Provider>
  );
}

export interface TocLinkProps
  extends ak.RoleProps<"a">, VariantProps<typeof tocLink> {
  /**
   * Custom list item element or props around the link. Defaults to an `li`,
   * unless the link is in a `TocItem`, which renders the list item itself. Set
   * `false` for a custom wrapper. All other props, including `ref` and
   * `render`, belong to the anchor.
   */
  item?: React.ReactElement | ak.RoleProps<"li"> | false;
}

/**
 * A link to a heading on the page. `Toc` marks it with
 * `aria-current="location"` while its section is being read. The guide and
 * thumb pieces, and the number marker of a top-level row in an ordered `Toc`,
 * render after the children and stay hidden from assistive technology.
 * @example
 * <Toc label="On this page">
 *   <TocLink href="#overview">Overview</TocLink>
 * </Toc>
 * @example
 * <Toc label="On this page">
 *   <TocLink href="#usage" $selectedInk={100} $selectedBold>
 *     Usage
 *   </TocLink>
 * </Toc>
 */
export function TocLink({ item, ...props }: TocLinkProps) {
  const [variantProps, rest] = splitProps(props, tocLink);
  const id = React.useId();
  const registry = React.useContext(TocRegistryContext);
  const currentId = React.useContext(TocCurrentContext);
  const level = React.useContext(TocLevelContext);
  const linkRef = React.useRef<HTMLAnchorElement>(null);
  const thumbRef = React.useRef<HTMLSpanElement>(null);
  const markerRef = React.useRef<HTMLSpanElement>(null);
  const ref = useMergeRefs(linkRef, rest.ref);
  const hasMarker = level.ordered && level.depth <= 1;
  const { href } = rest;

  // A marker that appears or goes registers the link again, so the table of
  // contents measures it.
  useSafeLayoutEffect(() => {
    if (!registry) return;
    return registry.register(id, {
      href,
      link: linkRef,
      thumb: thumbRef,
      marker: markerRef,
    });
  }, [registry, id, href, hasMarker]);

  // The pieces come last, so slot styles that look at earlier siblings work as
  // in a nav link.
  const pieces = (
    <>
      <span aria-hidden {...tocLinkGuide.jsx()} />
      <span aria-hidden ref={thumbRef} {...tocLinkThumb.jsx()} />
      {hasMarker && (
        <span aria-hidden ref={markerRef} {...tocLinkMarker.jsx()} />
      )}
    </>
  );
  const link = (
    <ak.Role.a
      aria-current={currentId === id ? "location" : undefined}
      {...tocLink.jsx(variantProps)}
      {...rest}
      ref={ref}
    >
      {appendOptionalChild(rest.children, pieces)}
    </ak.Role.a>
  );
  if (item === false) {
    return link;
  }
  if (item == null && level.item) {
    return link;
  }
  return createRender(ak.Role.li, item, { children: link });
}
