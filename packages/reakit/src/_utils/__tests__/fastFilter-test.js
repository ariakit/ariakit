import fastFilter from "../fastFilter";

test("filters an array", () => {
  expect(fastFilter(x => x > 3, [1, 2, 3, 4, 5])).toEqual([4, 5]);
});

test("keep all", () => {
  expect(fastFilter(() => true, [1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
});

test("keep none", () => {
  expect(fastFilter(() => false, [1, 2, 3, 4, 5])).toEqual([]);
});
