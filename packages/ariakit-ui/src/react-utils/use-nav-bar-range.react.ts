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
}

/**
 * Measures the bar pieces on the guide of a navigation, so its style component
 * can cover a range of links with one bar. It keeps the range in the inline
 * styles of the pieces and of the markers, so a new range re-renders nothing.
 * Provide the returned store with `NavBarRangeContext`, so the links register
 * their pieces, and set the range with `setRange`.
 * @example
 * const barRange = useNavBarRange({ rootRef });
 * barRange.setRange({ first, last });
 * <NavBarRangeContext.Provider value={barRange}>
 *   <nav ref={rootRef} />
 * </NavBarRangeContext.Provider>
 */
export function useNavBarRange({ rootRef }: UseNavBarRangeParams) {
  const entriesRef = React.useRef(new Map<string, NavBarRangeEntry>());
  // No range is known before the owner sets the first one.
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
    }),
    [],
  );

  useSafeLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const doc = getDocument(root);
    const win = getWindow(root);
    const entries = [...entriesRef.current];
    let rows = new Map<string, NavBarRow>();
    let markers: NavBarMarkerRow[] = [];
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
        bar.style.setProperty("--nav-bar-top", `${getOffset(barRect.top)}px`);
        // A piece ends this far from the row edges, so the bar covers the line
        // along the links in the range and the bends between them.
        const joint = linkRect.bottom - barRect.bottom;
        // The bar stops at a marker. The halo of a dot is shorter than its row,
        // so a bar that ran to the row edge would show past the halo.
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

    const apply = () => {
      const range = getRange();
      // A hidden navigation has no range. When it shows again, its first range
      // appears at once, like the first one after hydration.
      if (!range) {
        ready = false;
        return;
      }
      // The range goes on each piece that reads it, which glides it, so a glide
      // restyles only these pieces, not every row.
      const bars = entries.map(([, entry]) => entry.bar.current);
      const elements = markers.map((marker) => marker.element);
      const pieces = [...bars, ...elements].filter((piece) => piece != null);
      const setRange = () => {
        for (const piece of pieces) {
          piece.style.setProperty("--nav-bar-start", `${range.start}px`);
          piece.style.setProperty("--nav-bar-end", `${range.end}px`);
        }
        // A marker fills over time where the bar arrives, and empties at once
        // where it leaves, because the bar has already gone by then. The fill
        // reads the position of the marker, which goes on with the range,
        // because a layout read before the first range would start the fill
        // transition.
        for (const { element, top, bottom } of markers) {
          element.style.setProperty("--nav-bar-top", `${top}px`);
          if (range.start <= top && bottom <= range.end) {
            element.style.removeProperty("--nav-fill-duration");
          } else {
            element.style.setProperty("--nav-fill-duration", "0s");
          }
        }
      };
      if (ready) {
        setRange();
        return;
      }
      ready = true;
      // Reading the style applies the range before the transitions turn back
      // on, so only later ranges glide. The fill of a marker is a
      // pseudo-element with its own transition, so it needs its own read.
      for (const piece of pieces) {
        piece.style.transitionDuration = "0s";
      }
      setRange();
      for (const piece of pieces) {
        win.getComputedStyle(piece).getPropertyValue("--nav-bar-start");
        win.getComputedStyle(piece, "::after").getPropertyValue("clip-path");
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
  }, [rootRef, version]);

  return store;
}
