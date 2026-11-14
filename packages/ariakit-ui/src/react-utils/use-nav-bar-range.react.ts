import { useSafeLayoutEffect } from "@ariakit/react-utils";
import { getDocument, getWindow, isNode } from "@ariakit/utils";
import * as React from "react";

/**
 * The elements of a link that the bar range measures. Refs, not elements, so
 * pieces that remount without registering again stay current.
 */
export interface NavBarRangeEntry {
  link: React.RefObject<HTMLElement | null>;
  /** The bar piece on the guide of the link. */
  bar: React.RefObject<HTMLElement | null>;
  /** The marker of the link, which CSS can hide. */
  marker: React.RefObject<HTMLElement | null>;
}

/** The links that the bar covers, by the ids they registered with. */
export interface NavBarRange {
  first: string;
  last: string;
}

export interface NavBarRangeStore {
  /** Registers the pieces of a link, and returns a function that removes it. */
  register: (id: string, entry: NavBarRangeEntry) => () => void;
  /**
   * Covers the links from `first` to `last`. With `null`, the empty range waits
   * at the first link.
   */
  setRange: (range: NavBarRange | null) => void;
  /**
   * Removes the measured range, so CSS draws the bar of each current link
   * again, as before the first range. The next range appears at once.
   */
  clearRange: () => void;
}

/**
 * The bar range of the navigation around a link, when its style component sets
 * one. Links register their pieces in it.
 */
export const NavBarRangeContext = React.createContext<NavBarRangeStore | null>(
  null,
);

interface NavBarRow {
  top: number;
  bottom: number;
}

interface NavBarMarkerRow extends NavBarRow {
  element: HTMLElement;
}

function isVisible(element: Element) {
  return element.getClientRects().length > 0;
}

// CSS decides whether the marker of a link shows.
function getVisibleMarker(entry: NavBarRangeEntry) {
  const marker = entry.marker.current;
  if (!marker) return null;
  if (!isVisible(marker)) return null;
  return marker;
}

export interface UseNavBarRangeParams {
  /** The navigation element, which is the origin of the range. */
  rootRef: React.RefObject<HTMLElement | null>;
  /**
   * Grows the first range from no length at its start, so the bar doesn't show
   * at once. Use it when nothing draws a bar before the first range, as in a
   * table of contents, whose range comes from a script. Defaults to `false`.
   */
  growFirstRange?: boolean;
}

/**
 * Measures the bar pieces on the guide of a navigation, so its style component
 * can cover a range of links with one bar. It keeps the range in the inline
 * styles of the pieces and of the markers, so a new range re-renders nothing.
 * Provide the returned store with `NavBarRangeContext`, so the links register
 * their pieces, and set the range with `setRange`. Until the first range, and
 * after `clearRange`, CSS draws the bar of each current link. The first range
 * shows at once, or grows from its start with `growFirstRange`.
 * @example
 * const barRange = useNavBarRange({ rootRef });
 * barRange.setRange({ first, last });
 * <NavBarRangeContext.Provider value={barRange}>
 *   <nav ref={rootRef} />
 * </NavBarRangeContext.Provider>
 */
export function useNavBarRange({
  rootRef,
  growFirstRange = false,
}: UseNavBarRangeParams) {
  const entriesRef = React.useRef(new Map<string, NavBarRangeEntry>());
  // The first range waits, then has no length for one frame, then shows.
  const firstRangeRef = React.useRef<"waiting" | "collapsed" | "shown">(
    "waiting",
  );
  // No range is known before the owner sets the first one, or after it clears
  // the range.
  const rangeRef = React.useRef<NavBarRange | null | undefined>(undefined);
  const applyRef = React.useRef<(() => void) | null>(null);
  const [version, setVersion] = React.useState(0);

  const store = React.useMemo<NavBarRangeStore>(
    () => ({
      register: (id, entry) => {
        entriesRef.current.set(id, entry);
        setVersion((value) => value + 1);
        return () => {
          entriesRef.current.delete(id);
          setVersion((value) => value + 1);
        };
      },
      setRange: (range) => {
        rangeRef.current = range;
        applyRef.current?.();
      },
      clearRange: () => {
        rangeRef.current = undefined;
        applyRef.current?.();
      },
    }),
    [],
  );

  useSafeLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const doc = getDocument(root);
    const win = getWindow(root);
    const entries = [...entriesRef.current];
    // A navigation without pieces, such as one without a guide, has no range.
    if (!entries.length) return;
    let rows = new Map<string, NavBarRow>();
    let markers: NavBarMarkerRow[] = [];
    // The top of each bar piece. It goes on the piece with the range, because
    // the range that CSS sets without a measured one is in the box of the
    // piece.
    let barTops = new Map<HTMLElement, number>();
    let firstRow: NavBarRow | null = null;
    let ready = false;

    // Measures each piece relative to the content of the root, which stays the
    // same while the page or the root scrolls.
    const measure = () => {
      // Rects include the CSS zoom of the root, unlike the lengths the pieces
      // compare in CSS.
      const zoom = root.currentCSSZoom || 1;
      const rootRect = root.getBoundingClientRect();
      const originTop = rootRect.top + (root.clientTop - root.scrollTop) * zoom;
      const getOffset = (y: number) => (y - originTop) / zoom;
      rows = new Map();
      markers = [];
      barTops = new Map();
      firstRow = null;
      for (const [id, entry] of entries) {
        const link = entry.link.current;
        const bar = entry.bar.current;
        const marker = getVisibleMarker(entry);
        const markerRect = marker?.getBoundingClientRect();
        const markerRow = markerRect && {
          top: getOffset(markerRect.top),
          bottom: getOffset(markerRect.bottom),
        };
        if (marker && markerRow) {
          markers.push({ ...markerRow, element: marker });
        }
        if (!link) continue;
        if (!bar) continue;
        if (!isVisible(bar)) continue;
        const linkRect = link.getBoundingClientRect();
        const barRect = bar.getBoundingClientRect();
        barTops.set(bar, getOffset(barRect.top));
        // A piece ends this far from the row edges, so the bar covers the line
        // along the links in the range and the bends between them.
        const joint = linkRect.bottom - barRect.bottom;
        // The bar stops at a marker. The gap around a dot is shorter than its
        // row, so a bar that ran to the row edge would show past the gap.
        const row = markerRow ?? {
          top: getOffset(linkRect.top + joint),
          bottom: getOffset(barRect.bottom),
        };
        rows.set(id, row);
        if (!firstRow || row.top < firstRow.top) {
          firstRow = row;
        }
      }
    };

    const getRange = () => {
      const range = rangeRef.current;
      if (range === undefined) return null;
      if (!firstRow) return null;
      // With no link to cover, the empty range waits at the first row.
      if (!range) return { start: firstRow.top, end: firstRow.top };
      const start = rows.get(range.first)?.top ?? firstRow.top;
      const end = rows.get(range.last)?.bottom ?? start;
      return { start, end };
    };

    // The pieces that read the range: the bars and the markers that show.
    const getPieces = () => {
      const bars = entries.map(([, entry]) => entry.bar.current);
      const elements = markers.map((marker) => marker.element);
      return [...bars, ...elements].filter((piece) => piece != null);
    };

    // CSS draws the bar of each current link from a range in the box of its own
    // piece, so the measured values go. The pieces stop their transitions until
    // the next measured range, because a glide between the CSS ranges of two
    // pieces would show their bends for a moment.
    const clear = () => {
      for (const piece of getPieces()) {
        piece.style.transitionDuration = "0s";
        piece.style.removeProperty("--nav-bar-start");
        piece.style.removeProperty("--nav-bar-end");
        piece.style.removeProperty("--nav-bar-top");
      }
    };

    const apply = () => {
      if (rangeRef.current === undefined) {
        clear();
        ready = false;
        return;
      }
      const range = getRange();
      // A hidden navigation has no range. When it shows again, its range
      // appears at once.
      if (!range) {
        ready = false;
        return;
      }
      // The first range starts with no length at its start, and grows to its
      // place on the next frame. Until then, every update keeps it without a
      // length, so an update in the same frame doesn't end the growth before it
      // starts.
      if (growFirstRange && firstRangeRef.current === "waiting") {
        firstRangeRef.current = "collapsed";
        win.requestAnimationFrame(() => {
          firstRangeRef.current = "shown";
          applyRef.current?.();
        });
      }
      const collapsed = growFirstRange && firstRangeRef.current === "collapsed";
      const start = `${range.start}px`;
      const end = collapsed ? start : `${range.end}px`;
      // The range goes on each piece that reads it, which glides it, so a glide
      // restyles only these pieces, not every row. The top of a piece goes on
      // with the range.
      const pieces = getPieces();
      const setRange = () => {
        for (const [, entry] of entries) {
          const bar = entry.bar.current;
          if (!bar) continue;
          bar.style.setProperty("--nav-bar-start", start);
          bar.style.setProperty("--nav-bar-end", end);
          const top = barTops.get(bar);
          if (top == null) continue;
          bar.style.setProperty("--nav-bar-top", `${top}px`);
        }
        // The highlight of a marker reads the whole range, so it follows the
        // bar as the range glides.
        for (const { element, top } of markers) {
          element.style.setProperty("--nav-bar-start", start);
          element.style.setProperty("--nav-bar-end", end);
          element.style.setProperty("--nav-bar-top", `${top}px`);
        }
      };
      if (ready) {
        setRange();
        return;
      }
      ready = true;
      // Reading the style applies the range before the transitions turn back
      // on, so only later ranges glide. The highlight of a marker animates the
      // range on a pseudo-element, which takes its duration from the marker and
      // needs its own read.
      for (const piece of pieces) {
        piece.style.transitionDuration = "0s";
      }
      setRange();
      for (const piece of pieces) {
        win.getComputedStyle(piece).getPropertyValue("--nav-bar-start");
        const highlight = win.getComputedStyle(piece, "::after");
        highlight.getPropertyValue("--nav-bar-start");
      }
      for (const piece of pieces) {
        piece.style.transitionDuration = "";
      }
    };

    const refresh = () => {
      measure();
      apply();
    };

    refresh();
    applyRef.current = apply;

    const observer = new win.ResizeObserver(refresh);
    observer.observe(root);
    const lists = new Set<Element>();
    for (const [, entry] of entries) {
      // CSS can show a marker without resizing its row.
      const marker = entry.marker.current;
      if (marker) {
        observer.observe(marker);
      }
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

    // A popover or dialog can scale the navigation while it opens, and a
    // transform doesn't resize it, so the pieces are measured again when an
    // animation around the root ends. The corrected range appears at once.
    const onAnimationEnd = (event: Event) => {
      const { target } = event;
      if (target === root) return;
      // Event targets can come from another realm, which this check allows.
      if (!isNode(target)) return;
      if (!target.contains(root)) return;
      ready = false;
      refresh();
    };

    doc.addEventListener("transitionend", onAnimationEnd, true);
    doc.addEventListener("animationend", onAnimationEnd, true);
    // Late fonts resize the rows, which the observer measures again, and can
    // wrap labels without a resize of the list.
    void doc.fonts?.ready.then(() => {
      if (!root.isConnected) return;
      if (applyRef.current !== apply) return;
      refresh();
    });

    return () => {
      applyRef.current = null;
      observer.disconnect();
      doc.removeEventListener("transitionend", onAnimationEnd, true);
      doc.removeEventListener("animationend", onAnimationEnd, true);
    };
  }, [rootRef, growFirstRange, version]);

  return store;
}
