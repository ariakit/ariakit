export type FocusPresentationAlignment = "center" | "nearest";

type LengthProperty =
  | "scrollMarginTop"
  | "scrollMarginRight"
  | "scrollMarginBottom"
  | "scrollMarginLeft"
  | "scrollPaddingTop"
  | "scrollPaddingRight"
  | "scrollPaddingBottom"
  | "scrollPaddingLeft";

interface NearestDeltaParams {
  targetStart: number;
  targetEnd: number;
  scrollportStart: number;
  scrollportEnd: number;
}

function getLength(
  style: CSSStyleDeclaration,
  property: LengthProperty,
  percentageBasis = 0,
) {
  const value = style[property].trim();
  if (value === "0") return 0;
  if (value.endsWith("px")) {
    const pixels = Number.parseFloat(value);
    return Number.isFinite(pixels) ? pixels : 0;
  }
  if (value.endsWith("%")) {
    const percentage = Number.parseFloat(value);
    return Number.isFinite(percentage)
      ? (percentage * percentageBasis) / 100
      : 0;
  }
  return 0;
}

function getScale(rectSize: number, layoutSize: number) {
  if (rectSize <= 0) return 1;
  if (layoutSize <= 0) return 1;
  return rectSize / layoutSize;
}

function getNearestDelta({
  targetStart,
  targetEnd,
  scrollportStart,
  scrollportEnd,
}: NearestDeltaParams) {
  const targetSize = targetEnd - targetStart;
  const scrollportSize = scrollportEnd - scrollportStart;
  if (targetStart < scrollportStart && targetEnd > scrollportEnd) return 0;
  if (targetStart < scrollportStart) {
    return targetSize <= scrollportSize
      ? targetStart - scrollportStart
      : targetEnd - scrollportEnd;
  }
  if (targetEnd > scrollportEnd) {
    return targetSize <= scrollportSize
      ? targetEnd - scrollportEnd
      : targetStart - scrollportStart;
  }
  return 0;
}

function getPixelValue(value: string) {
  if (!value.endsWith("px")) return null;
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : null;
}

function getLayoutSize(
  element: HTMLElement,
  style: CSSStyleDeclaration,
  axis: "width" | "height",
) {
  const size = getPixelValue(style[axis]);
  if (size === null) {
    return axis === "width" ? element.offsetWidth : element.offsetHeight;
  }
  if (style.boxSizing === "border-box") return size;
  const start = axis === "width" ? "Left" : "Top";
  const end = axis === "width" ? "Right" : "Bottom";
  return (
    size +
    (getPixelValue(style[`padding${start}`]) || 0) +
    (getPixelValue(style[`padding${end}`]) || 0) +
    (getPixelValue(style[`border${start}Width`]) || 0) +
    (getPixelValue(style[`border${end}Width`]) || 0)
  );
}

/**
 * Presents a target by scrolling only its explicitly owned scrollport.
 */
export function scrollIntoView(
  target: HTMLElement,
  scrollport: HTMLElement,
  alignment: FocusPresentationAlignment,
) {
  if (!scrollport.isConnected) return;
  if (!scrollport.contains(target)) return;

  const view = scrollport.ownerDocument.defaultView;
  if (!view) return;

  const scrollportRect = scrollport.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const scrollportStyle = view.getComputedStyle(scrollport);
  const targetStyle = view.getComputedStyle(target);
  const scaleX = getScale(
    scrollportRect.width,
    getLayoutSize(scrollport, scrollportStyle, "width"),
  );
  const scaleY = getScale(
    scrollportRect.height,
    getLayoutSize(scrollport, scrollportStyle, "height"),
  );

  const scrollportLeft =
    scrollportRect.left +
    (scrollport.clientLeft +
      getLength(scrollportStyle, "scrollPaddingLeft", scrollport.clientWidth)) *
      scaleX;
  const scrollportRight =
    scrollportRect.left +
    (scrollport.clientLeft +
      scrollport.clientWidth -
      getLength(
        scrollportStyle,
        "scrollPaddingRight",
        scrollport.clientWidth,
      )) *
      scaleX;
  const scrollportTop =
    scrollportRect.top +
    (scrollport.clientTop +
      getLength(scrollportStyle, "scrollPaddingTop", scrollport.clientHeight)) *
      scaleY;
  const scrollportBottom =
    scrollportRect.top +
    (scrollport.clientTop +
      scrollport.clientHeight -
      getLength(
        scrollportStyle,
        "scrollPaddingBottom",
        scrollport.clientHeight,
      )) *
      scaleY;

  const targetLeft =
    targetRect.left - getLength(targetStyle, "scrollMarginLeft") * scaleX;
  const targetRight =
    targetRect.right + getLength(targetStyle, "scrollMarginRight") * scaleX;
  const targetTop =
    targetRect.top - getLength(targetStyle, "scrollMarginTop") * scaleY;
  const targetBottom =
    targetRect.bottom + getLength(targetStyle, "scrollMarginBottom") * scaleY;

  const verticalWritingMode =
    scrollportStyle.writingMode.startsWith("vertical") ||
    scrollportStyle.writingMode.startsWith("sideways");
  const deltaX =
    alignment === "center" && verticalWritingMode
      ? (targetLeft + targetRight - scrollportLeft - scrollportRight) /
        2 /
        scaleX
      : getNearestDelta({
          targetStart: targetLeft,
          targetEnd: targetRight,
          scrollportStart: scrollportLeft,
          scrollportEnd: scrollportRight,
        }) / scaleX;
  const deltaY =
    alignment === "center" && !verticalWritingMode
      ? (targetTop + targetBottom - scrollportTop - scrollportBottom) /
        2 /
        scaleY
      : getNearestDelta({
          targetStart: targetTop,
          targetEnd: targetBottom,
          scrollportStart: scrollportTop,
          scrollportEnd: scrollportBottom,
        }) / scaleY;

  // Let CSSOM clamp against the element's actual scroll origin and range. This
  // covers RTL, vertical writing modes, and reverse flex directions without
  // duplicating browser-specific scroll-coordinate rules here.
  if (Number.isFinite(deltaX) && deltaX) scrollport.scrollLeft += deltaX;
  if (Number.isFinite(deltaY) && deltaY) scrollport.scrollTop += deltaY;
}
