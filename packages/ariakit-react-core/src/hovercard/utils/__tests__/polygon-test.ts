import type { Polygon } from "../polygon.js";
import { isPointInPolygon } from "../polygon.js";

test("isPointInPolygon", () => {
  const polygon: Polygon = [
    [2, 2],
    [2, 4],
    [4, 4],
    [4, 2],
  ];

  expect(isPointInPolygon([0, 0], polygon)).toBe(false);
  expect(isPointInPolygon([1, 0], polygon)).toBe(false);
  expect(isPointInPolygon([2, 0], polygon)).toBe(false);
  expect(isPointInPolygon([3, 0], polygon)).toBe(false);
  expect(isPointInPolygon([4, 0], polygon)).toBe(false);
  expect(isPointInPolygon([5, 0], polygon)).toBe(false);

  expect(isPointInPolygon([0, 1], polygon)).toBe(false);
  expect(isPointInPolygon([1, 1], polygon)).toBe(false);
  expect(isPointInPolygon([2, 1], polygon)).toBe(false);
  expect(isPointInPolygon([3, 1], polygon)).toBe(false);
  expect(isPointInPolygon([4, 1], polygon)).toBe(false);
  expect(isPointInPolygon([5, 1], polygon)).toBe(false);

  expect(isPointInPolygon([0, 2], polygon)).toBe(false);
  expect(isPointInPolygon([1, 2], polygon)).toBe(false);
  expect(isPointInPolygon([2, 2], polygon)).toBe(true);
  expect(isPointInPolygon([3, 2], polygon)).toBe(true);
  expect(isPointInPolygon([4, 2], polygon)).toBe(true);
  expect(isPointInPolygon([5, 2], polygon)).toBe(false);

  expect(isPointInPolygon([0, 3], polygon)).toBe(false);
  expect(isPointInPolygon([1, 3], polygon)).toBe(false);
  expect(isPointInPolygon([2, 3], polygon)).toBe(true);
  expect(isPointInPolygon([3, 3], polygon)).toBe(true);
  expect(isPointInPolygon([4, 3], polygon)).toBe(true);
  expect(isPointInPolygon([5, 3], polygon)).toBe(false);

  expect(isPointInPolygon([0, 4], polygon)).toBe(false);
  expect(isPointInPolygon([1, 4], polygon)).toBe(false);
  expect(isPointInPolygon([2, 4], polygon)).toBe(true);
  expect(isPointInPolygon([3, 4], polygon)).toBe(true);
  expect(isPointInPolygon([4, 4], polygon)).toBe(true);
  expect(isPointInPolygon([5, 4], polygon)).toBe(false);

  expect(isPointInPolygon([0, 5], polygon)).toBe(false);
  expect(isPointInPolygon([1, 5], polygon)).toBe(false);
  expect(isPointInPolygon([2, 5], polygon)).toBe(false);
  expect(isPointInPolygon([3, 5], polygon)).toBe(false);
  expect(isPointInPolygon([4, 5], polygon)).toBe(false);
  expect(isPointInPolygon([5, 5], polygon)).toBe(false);
});
