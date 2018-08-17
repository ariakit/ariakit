import fastConcat from "../fastConcat";

test("concats two arrays", () => {
  const arr1 = [1, 2, 3];
  const arr2 = [4, 5, 6];
  expect(fastConcat(arr1, arr2)).toEqual([1, 2, 3, 4, 5, 6]);
});

test("handles one undefined args", () => {
  const arr1 = [1, 2, 3];
  expect(fastConcat(arr1)).toEqual([1, 2, 3]);
});

test("handles all undefined args", () => {
  expect(fastConcat()).toEqual([]);
});

test("handles empty array", () => {
  const arr1 = [1, 2, 3];
  const arr2 = [];
  expect(fastConcat(arr1, arr2)).toEqual([1, 2, 3]);
});

test.skip("is variadic", () => {
  const arr1 = [1, 2, 3];
  const arr2 = [4, 5, 6];
  const arr3 = [7, 8, 9];
  const arr4 = [10, 11];
  const correct = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  expect(fastConcat(arr1, arr2, arr3, arr4)).toEqual(correct);
});
