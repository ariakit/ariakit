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

function getEnterPointPlacement(enterPoint: Point, rect: DOMRect) {
  const { top, right, bottom, left } = rect;
  const [x, y] = enterPoint;
  const placementX = x < left ? "left" : x > right ? "right" : null;
  const placementY = y < top ? "top" : y > bottom ? "bottom" : null;
  return [placementX, placementY] as const;
}

export function getElementPolygon(element: Element, enterPoint: Point) {
  const rect = element.getBoundingClientRect();
  const { top, right, bottom, left } = rect;
  const [x, y] = getEnterPointPlacement(enterPoint, rect);
  const polygon = [enterPoint];
  if (x) {
    if (y !== "top") {
      polygon.push([x === "left" ? left : right, top]);
    }
    polygon.push([x === "left" ? right : left, top]);
    polygon.push([x === "left" ? right : left, bottom]);
    if (y !== "bottom") {
      polygon.push([x === "left" ? left : right, bottom]);
    }
  } else if (y === "top") {
    polygon.push([left, top]);
    polygon.push([left, bottom]);
    polygon.push([right, bottom]);
    polygon.push([right, top]);
  } else {
    polygon.push([left, bottom]);
    polygon.push([left, top]);
    polygon.push([right, top]);
    polygon.push([right, bottom]);
  }
  return polygon;
}
