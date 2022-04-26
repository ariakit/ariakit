// Based on https://github.com/floating-ui/floating-ui/blob/01aeb53ad7e4d105469b7fdc5057c067b6767a8b/packages/react-dom-interactions/src/FloatingOverlay.tsx
import { useSafeLayoutEffect } from "ariakit-utils/hooks";

function assignStyle(
  element: HTMLElement | null | undefined,
  style: Partial<CSSStyleDeclaration>
) {
  if (!element) return () => {};
  const previousStyle = element.style.cssText;
  Object.assign(element.style, style);
  return () => {
    element.style.cssText = previousStyle;
  };
}

export function usePreventBodyScroll(enabled?: boolean) {
  useSafeLayoutEffect(() => {
    if (!enabled) return;
    const { documentElement, body } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    // RTL <body> scrollbar
    const documentLeft = documentElement.getBoundingClientRect().left;
    const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft;
    const paddingProp = scrollbarX ? "paddingLeft" : "paddingRight";

    const restoreStyle = assignStyle(body, {
      position: "fixed",
      overflow: "hidden",
      top: `-${scrollY}px`,
      left: `-${scrollX}px`,
      right: "0",
      [paddingProp]: `${scrollbarWidth}px`,
    });

    const previousScrollbarWidth =
      documentElement.style.getPropertyValue("--scrollbar-width");

    documentElement.style.setProperty(
      "--scrollbar-width",
      `${scrollbarWidth}px`
    );

    return () => {
      restoreStyle();
      // istanbul ignore next: JSDOM doesn't implement window.scrollTo
      if (process.env.NODE_ENV !== "test") {
        window.scrollTo(scrollX, scrollY);
      }
      if (previousScrollbarWidth) {
        documentElement.style.setProperty(
          "--scrollbar-width",
          previousScrollbarWidth
        );
      } else {
        documentElement.style.removeProperty("--scrollbar-width");
      }
    };
  }, [enabled]);
}
