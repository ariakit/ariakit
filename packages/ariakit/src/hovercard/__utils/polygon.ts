import { HovercardState } from "../hovercard-state";

export type Point = [number, number];
export type Polygon = Point[];

export function getEventPoint(event: MouseEvent): Point {
  return [event.clientX, event.clientY];
}

export function isPointInPolygon(point: Point, polygon: Polygon) {
  const [x, y] = point;
  let isInside = false;
  const length = polygon.length;
  for (let i = 0, j = length - 1; i < length; j = i++) {
    const [xi, yi] = polygon[i] || [0, 0];
    const [xj, yj] = polygon[j] || [0, 0];
    const intersect =
      yi >= y !== yj >= y && x <= ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      isInside = !isInside;
    }
  }
  return isInside;
}

export function getElementPolygon(
  element: Element,
  placement: HovercardState["placement"]
): Polygon {
  const { top, right, bottom, left } = element.getBoundingClientRect();
  const [basePlacement] = placement.split("-");
  switch (basePlacement) {
    case "top": {
      return [
        [left, bottom],
        [left, top],
        [right, top],
        [right, bottom],
      ];
    }
    case "right": {
      return [
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom],
      ];
    }
    case "bottom": {
      return [
        [left, top],
        [left, bottom],
        [right, bottom],
        [right, top],
      ];
    }
    case "left":
    default: {
      return [
        [right, top],
        [left, top],
        [left, bottom],
        [right, bottom],
      ];
    }
  }
}
