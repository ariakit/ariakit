// Based on https://gist.github.com/hsablonniere/2581101

/**
 * Ponyfill for `Element.prototype.scrollIntoViewIfNeeded`
 *
 * @example
 * import { scrollIntoViewIfNeeded } from "reakit-utils";
 *
 * scrollIntoViewIfNeeded(document.getElementById("id"), true);
 * // same as
 * document.getElementById("id").scrollIntoViewIfNeeded(true);
 */
export function scrollIntoViewIfNeeded(element: HTMLElement, center?: boolean) {
  if ("scrollIntoViewIfNeeded" in element) {
    (element as any).scrollIntoViewIfNeeded(center);
    return;
  }

  const parent = element.parentElement;

  if (!parent) {
    return;
  }

  const parentComputedStyle = window.getComputedStyle(parent, null);
  const parentBorderTopWidth = parseInt(
    parentComputedStyle.getPropertyValue("border-top-width"),
    10
  );
  const parentBorderLeftWidth = parseInt(
    parentComputedStyle.getPropertyValue("border-left-width"),
    10
  );
  const overTop = element.offsetTop - parent.offsetTop < parent.scrollTop;
  const overBottom =
    element.offsetTop -
      parent.offsetTop +
      element.clientHeight -
      parentBorderTopWidth >
    parent.scrollTop + parent.clientHeight;
  const overLeft = element.offsetLeft - parent.offsetLeft < parent.scrollLeft;
  const overRight =
    element.offsetLeft -
      parent.offsetLeft +
      element.clientWidth -
      parentBorderLeftWidth >
    parent.scrollLeft + parent.clientWidth;
  const alignWithTop = overTop && !overBottom;

  if ((overTop || overBottom) && center) {
    parent.scrollTop =
      element.offsetTop -
      parent.offsetTop -
      parent.clientHeight / 2 -
      parentBorderTopWidth +
      element.clientHeight / 2;
  }

  if ((overLeft || overRight) && center) {
    parent.scrollLeft =
      element.offsetLeft -
      parent.offsetLeft -
      parent.clientWidth / 2 -
      parentBorderLeftWidth +
      element.clientWidth / 2;
  }

  if ((overTop || overBottom || overLeft || overRight) && !center) {
    element.scrollIntoView(alignWithTop);
  }
}
