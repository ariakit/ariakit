import { isFocusable } from "@ariakit/core/utils/focus";
import { isBrowser } from "./__utils.js";

if (!isBrowser && typeof window !== "undefined") {
  const originalFocus = window.HTMLElement.prototype.focus;
  window.HTMLElement.prototype.focus = function focus(options) {
    if (!isFocusable(this)) return;
    return originalFocus.call(this, options);
  };

  // @ts-expect-error
  window.Element.prototype.getClientRects = function getClientRects() {
    const isHidden = (element: Element) => {
      if (!element.isConnected) return true;
      if (element.parentElement && isHidden(element.parentElement)) return true;
      if (!(element instanceof HTMLElement)) return false;
      if (element.hidden) return true;
      const style = getComputedStyle(element);
      return style.display === "none" || style.visibility === "hidden";
    };
    if (isHidden(this)) {
      return [];
    }
    return [{ width: 1, height: 1 }];
  };
}
