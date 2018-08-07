import uniq from "../uniq";

test("removes duplicates", () => {
  expect(uniq([1, 1, 1, 1, 3, 1, 1, 1]).length).toEqual(2);
});

test("removes duplicates, edge case", () => {
  expect(uniq([1, 1, 1, 1, 1, 1, 1, 1]).length).toEqual(1);
});

test("[] returns []", () => {
  expect(uniq([])).toEqual([]);
});

test("falsy input returns []", () => {
  expect(uniq()).toEqual([]);
});
