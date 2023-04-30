// Based on https://github.com/floating-ui/floating-ui/blob/1201e72e67a80e479122293d46d96c9bbc8f156d/packages/react-dom-interactions/src/FloatingOverlay.tsx
import { getDocument, getWindow } from "@ariakit/core/utils/dom";
import { chain } from "@ariakit/core/utils/misc";
import { isApple, isMac } from "@ariakit/core/utils/platform";
import { useSafeLayoutEffect } from "../../utils/hooks.js";
import type { DialogStore } from "../dialog-store.js";
import { assignStyle, setCSSProperty } from "./orchestrate.js";

function getPaddingProperty(documentElement: HTMLElement) {
  // RTL <body> scrollbar
  const documentLeft = documentElement.getBoundingClientRect().left;
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft;
  return scrollbarX ? "paddingLeft" : "paddingRight";
}

export function usePreventBodyScroll(store: DialogStore, enabled?: boolean) {
  useSafeLayoutEffect(() => {
    if (!enabled) return;
    const { contentElement } = store.getState();
    if (!contentElement) return;

    const doc = getDocument(contentElement);
    const win = getWindow(contentElement);
    const { documentElement, body } = doc;
    const cssScrollbarWidth =
      documentElement.style.getPropertyValue("--scrollbar-width");
    const scrollbarWidth = cssScrollbarWidth
      ? parseInt(cssScrollbarWidth)
      : win.innerWidth - documentElement.clientWidth;

    const setScrollbarWidthProperty = () =>
      setCSSProperty(
        documentElement,
        "--scrollbar-width",
        `${scrollbarWidth}px`
      );

    const paddingProperty = getPaddingProperty(documentElement);

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
          win.scrollTo(scrollX, scrollY);
        }
      };
    };

    const isIOS = isApple() && !isMac();

    return chain(
      setScrollbarWidthProperty(),
      isIOS ? setIOSStyle() : setStyle()
    );
  }, [enabled]);
}
