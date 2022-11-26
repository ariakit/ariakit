export type Point = [number, number];
export type Polygon = Point[];

export function getEventPoint(event: MouseEvent): Point {
  return [event.clientX, event.clientY];
}

// Based on https://github.com/metafloor/pointinpoly
export function isPointInPolygon(point: Point, polygon: Polygon) {
  const [x, y] = point;
  let inside = false;
  const length = polygon.length;
  for (let l = length, i = 0, j = l - 1; i < l; j = i++) {
    const [xi, yi] = polygon[i] as Point;
    const [xj, yj] = polygon[j] as Point;
    const [, vy] = polygon[j === 0 ? l - 1 : j - 1] || [0, 0];
    const where = (yi - yj) * (x - xi) - (xi - xj) * (y - yi);
    if (yj < yi) {
      if (y >= yj && y < yi) {
        // point on the line
        if (where === 0) return true;
        if (where > 0) {
          if (y === yj) {
            // ray intersects vertex
            if (y > vy) {
              inside = !inside;
            }
          } else {
            inside = !inside;
          }
        }
      }
    } else if (yi < yj) {
      if (y > yi && y <= yj) {
        // point on the line
        if (where === 0) return true;
        if (where < 0) {
          if (y === yj) {
            // ray intersects vertex
            if (y < vy) {
              inside = !inside;
            }
          } else {
            inside = !inside;
          }
        }
      }
    } else if (y == yi && ((x >= xj && x <= xi) || (x >= xi && x <= xj))) {
      // point on horizontal edge
      return true;
    }
  }
  return inside;
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
