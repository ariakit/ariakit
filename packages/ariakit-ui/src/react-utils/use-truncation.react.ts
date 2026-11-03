import { useSafeLayoutEffect } from "@ariakit/react-utils";
import { getDocument, getWindow } from "@ariakit/utils";
import * as React from "react";

interface TruncationContextValue {
  setTruncated: (id: string, truncated: boolean | null) => void;
}

/**
 * Lets text report whether its element cuts it off, so an element around it,
 * such as the anchor of a tooltip, can react to it.
 */
export const TruncationContext =
  React.createContext<TruncationContextValue | null>(null);

/**
 * Tracks the text that reports through a `TruncationContext` provider with the
 * returned `context`. `truncated` is `undefined` while no text reports, and
 * otherwise tells whether any of the text is cut off.
 */
export function useTruncationRegistry() {
  const [entries, setEntries] = React.useState<ReadonlyMap<string, boolean>>(
    () => new Map(),
  );

  const setTruncated = React.useCallback(
    (id: string, truncated: boolean | null) => {
      setEntries((current) => {
        if (truncated === null && !current.has(id)) return current;
        if (current.get(id) === truncated) return current;
        const next = new Map(current);
        if (truncated === null) {
          next.delete(id);
        } else {
          next.set(id, truncated);
        }
        return next;
      });
    },
    [],
  );

  const context = React.useMemo(() => ({ setTruncated }), [setTruncated]);
  const truncated = entries.size
    ? Array.from(entries.values()).some(Boolean)
    : undefined;

  return { truncated, context };
}

/**
 * Whether an element cuts off its content, such as with `truncate`,
 * `line-clamp-*`, or a `$truncate` variant.
 */
function isTruncated(element: HTMLElement) {
  if (element.scrollWidth > element.clientWidth) return true;
  const overflowY = element.scrollHeight - element.clientHeight;
  if (overflowY <= 0) return false;
  // Glyphs taller than a short line overflow below it by less than half a line,
  // while a hidden line overflows by a whole line.
  const style = getWindow(element).getComputedStyle(element);
  const fontSize = Number.parseFloat(style.fontSize);
  // A line height of "normal" depends on the font and is close to 1.2.
  const lineHeight = Number.parseFloat(style.lineHeight) || fontSize * 1.2;
  return overflowY > lineHeight / 2;
}

/**
 * Reports to the nearest `TruncationContext` whether the element cuts off its
 * content. It measures again when the element resizes, when its text or
 * attributes change, and when a font loads. New text, a class, a style, or a
 * font can change the size of the text and keep the size of an element that
 * cuts it off. An element without layout boxes, such as one with
 * `display: none`, counts as if it weren't rendered. An element with
 * `visibility: hidden` keeps its boxes and still counts: its visibility can
 * change through an element around it or a state such as hover, and nothing
 * here would measure it again.
 */
export function useTruncation(element: HTMLElement | null) {
  const context = React.useContext(TruncationContext);
  const setTruncated = context?.setTruncated;
  const id = React.useId();

  useSafeLayoutEffect(() => {
    if (!element) return;
    if (!setTruncated) return;
    const update = () => {
      const hidden = !element.getClientRects().length;
      setTruncated(id, hidden ? null : isTruncated(element));
    };
    // The measure runs before paint, so the first frame already knows whether
    // the text is cut off.
    update();
    // Some environments, such as jsdom and happy-dom, don't implement all of
    // these APIs.
    const win: Partial<typeof globalThis> = getWindow(element);
    const doc: Partial<Document> = getDocument(element);
    const resizeObserver = win.ResizeObserver && new win.ResizeObserver(update);
    resizeObserver?.observe(element);
    // Text can change below the element, such as in a child component that
    // renders on its own, and a new class or style can change the size of the
    // text but not the size of the element.
    const mutationObserver =
      win.MutationObserver && new win.MutationObserver(update);
    mutationObserver?.observe(element, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });
    doc.fonts?.addEventListener("loadingdone", update);
    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      doc.fonts?.removeEventListener("loadingdone", update);
      setTruncated(id, null);
    };
  }, [element, setTruncated, id]);
}
