// Based on https://github.com/floating-ui/floating-ui/blob/1201e72e67a80e479122293d46d96c9bbc8f156d/packages/react-dom-interactions/src/FloatingOverlay.tsx
import { useSafeLayoutEffect } from "@ariakit/react-utils";
import { getDocument, getWindow, chain, isApple, isMac } from "@ariakit/utils";
import { useEffect } from "react";
import { assignStyle, setCSSProperty } from "./orchestrate.ts";
import { useRootDialog } from "./use-root-dialog.ts";

// Only iOS doesn't respect `overflow: hidden` on document.body.
const isIOS = isApple() && !isMac();

function getPaddingProperty(documentElement: HTMLElement) {
  // RTL <body> scrollbar
  const documentLeft = documentElement.getBoundingClientRect().left;
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft;
  return scrollbarX ? "paddingLeft" : "paddingRight";
}

export function usePreventBodyScroll(
  contentElement: HTMLElement | null,
  contentId?: string,
  enabled?: boolean,
) {
  const isRootDialog = useRootDialog({
    attribute: "data-dialog-prevent-body-scroll",
    contentElement,
    contentId,
    enabled,
  });

  // On iOS, the lock runs synchronously in the passive phase: its scroll
  // position bookkeeping (capture on lock, scrollTo on unlock) depends on the
  // passive timing relative to the dialog's focus effects. The hook choice is
  // stable because isIOS never changes within a session.
  const useLockEffect = isIOS ? useEffect : useSafeLayoutEffect;

  useLockEffect(() => {
    if (!isRootDialog()) return;
    if (!contentElement) return;
    const doc = getDocument(contentElement);
    const win = getWindow(contentElement);
    const { documentElement, body } = doc;

    // Reads the scrollbar width and position. These force a style and layout
    // flush, so the deferred path below runs this before the open frame
    // paints, where that flush has already been performed for the commit, and
    // keeps the after-paint callback write-only.
    const measure = () => {
      const cssScrollbarWidth =
        documentElement.style.getPropertyValue("--scrollbar-width");
      const scrollbarWidth = cssScrollbarWidth
        ? Number.parseInt(cssScrollbarWidth, 10)
        : win.innerWidth - documentElement.clientWidth;
      const paddingProperty = getPaddingProperty(documentElement);
      return { scrollbarWidth, paddingProperty };
    };

    const lock = ({
      scrollbarWidth,
      paddingProperty,
    }: ReturnType<typeof measure>) => {
      const setScrollbarWidthProperty = () =>
        setCSSProperty(
          documentElement,
          "--scrollbar-width",
          `${scrollbarWidth}px`,
        );

      const setStyle = () =>
        assignStyle(body, {
          overflow: "hidden",
          [paddingProperty]: `${scrollbarWidth}px`,
        });

      // Only iOS doesn't respect `overflow: hidden` on document.body
      const setIOSStyle = () => {
        const { scrollX, scrollY, visualViewport } = win;

        // iOS 12 does not support `visuaViewport`.
        const offsetLeft = visualViewport?.offsetLeft ?? 0;
        const offsetTop = visualViewport?.offsetTop ?? 0;

        const restoreStyle = assignStyle(body, {
          position: "fixed",
          overflow: "hidden",
          top: `${-(scrollY - Math.floor(offsetTop))}px`,
          left: `${-(scrollX - Math.floor(offsetLeft))}px`,
          right: "0",
          [paddingProperty]: `${scrollbarWidth}px`,
        });

        return () => {
          restoreStyle();
          // istanbul ignore next: JSDOM doesn't implement window.scrollTo
          if (process.env.NODE_ENV !== "test") {
            win.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
          }
        };
      };

      return chain(
        setScrollbarWidthProperty(),
        isIOS ? setIOSStyle() : setStyle(),
      );
    };

    if (isIOS) {
      const restore = lock(measure());
      return restore;
    }

    // Writing --scrollbar-width on documentElement invalidates the style of
    // the whole document (custom properties are inherited, so every element
    // is affected even when nothing references the variable). Paying that
    // before the open frame delays the dialog's first paint, so defer the
    // lock to right after that frame paints, in the same slot where the
    // dialog disables the outside tree. The measurement runs in the first
    // frame callback, keeping the after-paint callback write-only so it
    // can't force a style flush no matter how it's ordered with the inert
    // writes. The compositor only sees the lock a frame later, and the
    // backdrop already covers the page in the meantime.
    let restore: (() => void) | undefined;
    let raf = win.requestAnimationFrame(() => {
      const measurements = measure();
      raf = win.requestAnimationFrame(() => {
        restore = lock(measurements);
      });
    });

    return () => {
      win.cancelAnimationFrame(raf);
      if (!restore) return;
      const restoreLock = restore;
      // Defer the restore to a microtask so it runs after this commit's
      // layout effects, such as the dialog's focus-on-hide. This preserves
      // the close ordering the passive phase provided before: focus first
      // (while the scroll is still locked), then unlock. The orchestrate
      // stacks keep this safe if the scroll gets locked again in between.
      queueMicrotask(restoreLock);
    };
  }, [isRootDialog, contentElement]);
}
