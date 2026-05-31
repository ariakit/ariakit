import { expect, test } from "vitest";
import type { Point, Polygon } from "./polygon.ts";
import { isPointInPolygon } from "./polygon.ts";

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

test("isPointInPolygon handles horizontal rays crossing slanted vertices", () => {
  const topPolygon: Polygon = [
    [3, 0],
    [2, 2],
    [2, 4],
    [4, 4],
    [4, 2],
  ];

  expect(isPointInPolygon([3, 0], topPolygon)).toBe(true);
  expect(isPointInPolygon([2.5, 1], topPolygon)).toBe(true);
  expect(isPointInPolygon([3.5, 1], topPolygon)).toBe(true);
  expect(isPointInPolygon([3, 2], topPolygon)).toBe(true);
  expect(isPointInPolygon([5, 2], topPolygon)).toBe(false);
  // The apex [3, 0] is a local extremum, so the horizontal ray grazing it must
  // not be counted as a crossing. Without the vy guard this point would toggle.
  expect(isPointInPolygon([5, 0], topPolygon)).toBe(false);

  const leftPolygon: Polygon = [
    [0, 3],
    [2, 2],
    [4, 2],
    [4, 4],
    [2, 4],
  ];

  expect(isPointInPolygon([0, 3], leftPolygon)).toBe(true);
  expect(isPointInPolygon([1, 2.5], leftPolygon)).toBe(true);
  expect(isPointInPolygon([1, 3], leftPolygon)).toBe(true);
  expect(isPointInPolygon([1, 3.5], leftPolygon)).toBe(true);
  expect(isPointInPolygon([1, 5], leftPolygon)).toBe(false);

  // Mirror of topPolygon with a downward apex, exercising the same vertex guard
  // on the opposite (y < vy) branch.
  const bottomPolygon: Polygon = [
    [3, 6],
    [2, 4],
    [2, 2],
    [4, 2],
    [4, 4],
  ];

  expect(isPointInPolygon([3, 6], bottomPolygon)).toBe(true);
  expect(isPointInPolygon([2.5, 5], bottomPolygon)).toBe(true);
  expect(isPointInPolygon([3.5, 5], bottomPolygon)).toBe(true);
  expect(isPointInPolygon([3, 4], bottomPolygon)).toBe(true);
  expect(isPointInPolygon([5, 4], bottomPolygon)).toBe(false);
  // The downward apex [3, 6] is also a local extremum, so its grazing ray must
  // not toggle either.
  expect(isPointInPolygon([5, 6], bottomPolygon)).toBe(false);
});

test("isPointInPolygon returns false for malformed polygons", () => {
  const polygon: Array<Point | undefined> = [
    [2, 2],
    [2, 4],
    [4, 4],
    [4, 2],
  ];
  polygon[1] = undefined;

  expect(isPointInPolygon([3, 3], polygon as Polygon)).toBe(false);
});
