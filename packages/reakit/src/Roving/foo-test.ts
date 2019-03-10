import { unstable_RovingState } from "./RovingState";

function findCoords(
  { active, matrix, loop }: unstable_RovingState,
  dir: "up" | "right" | "down" | "left"
): [number, number] | null {
  const [row, col] = active;
  const isVertical = dir === "up" || dir === "down";
  const isAdditive = dir === "down" || dir === "right";
  const items = isVertical ? matrix.map(cols => cols[col]) : matrix[row];

  if (items.filter(Boolean).length === 0) return null;

  let coord = isVertical ? row : col;

  if (isAdditive) {
    do {
      coord = coord === items.length && loop ? 0 : coord + 1;
    } while (coord < items.length && !items[coord]);
    if (coord >= items.length) return null;
  } else {
    do {
      coord = coord === 0 && loop ? items.length - 1 : coord - 1;
    } while (coord >= 0 && !items[coord]);
    if (coord < 0) return null;
  }
  return isVertical ? [coord, col] : [row, coord];
}

const matrix = [
  /** **** 0  1  2  3  4 */
  /* 0 */ [0, 0, 1, 1, 1],
  /* 1 */ [1, 1, 1, 1, 1],
  /* 2 */ [0, 0, 1, 0, 0],
  /* 3 */ [1, 1, 1, 1, 1],
  /* 4 */ [0, 1, 1, 0, 0]
];

test("foo", () => {
  expect(findCoords({ matrix, active: [1, 2] }, "up")).toEqual([0, 2]);
  expect(findCoords({ matrix, active: [1, 1] }, "up")).toEqual(null);
  expect(findCoords({ matrix, active: [1, 1], loop: true }, "up")).toEqual([
    4,
    1
  ]);

  expect(findCoords({ matrix, active: [1, 2] }, "down")).toEqual([2, 2]);
  expect(findCoords({ matrix, active: [1, 1] }, "down")).toEqual([3, 1]);

  expect(findCoords({ matrix, active: [1, 0] }, "left")).toEqual(null);
  expect(findCoords({ matrix, active: [1, 0], loop: true }, "left")).toEqual([
    1,
    4
  ]);
});
