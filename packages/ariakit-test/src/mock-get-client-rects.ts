import { isBrowser } from "./__utils";

if (!isBrowser && typeof window !== "undefined") {
  // @ts-ignore
  window.Element.prototype.getClientRects = function getClientRects() {
    const isHidden = (element: Element) => {
      if (element.parentElement && isHidden(element.parentElement)) {
        return true;
      }
      if (!(element instanceof HTMLElement)) {
        return false;
      }
      if (element.hidden) {
        return true;
      }
      const style = getComputedStyle(element);
      return style.display === "none" || style.visibility === "hidden";
    };
    if (isHidden(this)) {
      return [];
    }
    return [{ width: 1, height: 1 }];
  };
}
