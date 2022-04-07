import { useSafeLayoutEffect } from "ariakit-utils/hooks";

export function usePreventBodyScroll(enabled?: boolean) {
  useSafeLayoutEffect(() => {
    if (!enabled) return;
    const { documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = documentElement.style.overflow;
    const previousPaddingRight = documentElement.style.paddingRight;
    const previousScrollbarWidth =
      documentElement.style.getPropertyValue("--scrollbar-width");
    documentElement.style.overflow = "hidden";
    documentElement.style.paddingRight = `${scrollbarWidth}px`;
    documentElement.style.setProperty(
      "--scrollbar-width",
      `${scrollbarWidth}px`
    );
    return () => {
      documentElement.style.overflow = previousOverflow;
      documentElement.style.paddingRight = previousPaddingRight;
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
