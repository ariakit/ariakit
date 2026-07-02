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
    const cssScrollbarWidth =
      documentElement.style.getPropertyValue("--scrollbar-width");
    const scrollbarWidth = cssScrollbarWidth
      ? Number.parseInt(cssScrollbarWidth, 10)
      : win.innerWidth - documentElement.clientWidth;

    const setScrollbarWidthProperty = () =>
      setCSSProperty(
        documentElement,
        "--scrollbar-width",
        `${scrollbarWidth}px`,
      );

    const setStyle = () => {
      // When there's no scrollbar width to compensate, only the overflow
      // needs to change. Skipping the --scrollbar-width and padding writes
      // isn't just avoiding no-ops: writing a custom property on
      // documentElement invalidates the style of the whole document (custom
      // properties are inherited, so every element is affected even when
      // nothing references the variable). Consumers read the property with a
      // zero fallback, so its absence is equivalent to the previous "0px".
      if (!scrollbarWidth) {
        return assignStyle(body, { overflow: "hidden" });
      }
      const paddingProperty = getPaddingProperty(documentElement);
      return chain(
        setScrollbarWidthProperty(),
        assignStyle(body, {
          overflow: "hidden",
          [paddingProperty]: `${scrollbarWidth}px`,
        }),
      );
    };

    // Only iOS doesn't respect `overflow: hidden` on document.body
    const setIOSStyle = () => {
      const { scrollX, scrollY, visualViewport } = win;

      // iOS 12 does not support `visuaViewport`.
      const offsetLeft = visualViewport?.offsetLeft ?? 0;
      const offsetTop = visualViewport?.offsetTop ?? 0;

      const paddingProperty = getPaddingProperty(documentElement);

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

    // The lock is always applied synchronously, before the dialog's first
    // paint. When a scrollbar is visible, hiding the overflow changes the
    // viewport size, which moves position: fixed elements — including the
    // dialog itself — so it must happen in the same frame the dialog first
    // paints in, or the dialog visibly jumps one frame after appearing.
    const restore = isIOS
      ? chain(
          scrollbarWidth ? setScrollbarWidthProperty() : undefined,
          setIOSStyle(),
        )
      : setStyle();

    if (isIOS) return restore;

    return () => {
      // Defer the restore to a microtask so it runs after this commit's
      // layout effects, such as the dialog's focus-on-hide. This preserves
      // the close ordering the passive phase provided before: focus first
      // (while the scroll is still locked), then unlock. The orchestrate
      // stacks keep this safe if the scroll gets locked again in between.
      queueMicrotask(restore);
    };
  }, [isRootDialog, contentElement]);
}
