// Based on https://github.com/floating-ui/floating-ui/blob/1201e72e67a80e479122293d46d96c9bbc8f156d/packages/react-dom-interactions/src/FloatingOverlay.tsx
import { RefObject } from "react";
import { getDocument, getWindow } from "ariakit-utils/dom";
import { useSafeLayoutEffect } from "ariakit-utils/hooks";
import { chain } from "ariakit-utils/misc";
import { isApple, isMac } from "ariakit-utils/platform";
import { useChampionDialog } from "./use-champion-dialog";

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

function setCSSProperty(
  element: HTMLElement | null | undefined,
  property: string,
  value: string
) {
  if (!element) return () => {};
  const previousValue = element.style.getPropertyValue(property);
  element.style.setProperty(property, value);
  return () => {
    if (previousValue) {
      element.style.setProperty(property, previousValue);
    } else {
      element.style.removeProperty(property);
    }
  };
}

function getPaddingProperty(documentElement: HTMLElement) {
  // RTL <body> scrollbar
  const documentLeft = documentElement.getBoundingClientRect().left;
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft;
  return scrollbarX ? "paddingLeft" : "paddingRight";
}

export function usePreventBodyScroll(
  dialogRef: RefObject<HTMLElement>,
  enabled?: boolean
) {
  const isChampionDialog = useChampionDialog(
    dialogRef,
    "data-dialog-body-scroll",
    enabled
  );

  useSafeLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!isChampionDialog()) return;

    const doc = getDocument(dialog);
    const win = getWindow(dialog);
    const { documentElement, body } = doc;
    const scrollbarWidth = win.innerWidth - documentElement.clientWidth;

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
  }, [dialogRef, isChampionDialog]);
}
