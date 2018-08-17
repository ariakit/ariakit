import fastFilter from "../fastFilter";

test("filters an array", () => {
  expect(fastFilter([1, 2, 3, 4, 5], x => x > 3)).toEqual([4, 5]);
});

test("keep all", () => {
  expect(fastFilter([1, 2, 3, 4, 5], () => true)).toEqual([1, 2, 3, 4, 5]);
});

test("keep none", () => {
  expect(fastFilter([1, 2, 3, 4, 5], () => false)).toEqual([]);
});
