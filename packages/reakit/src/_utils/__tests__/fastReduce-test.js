import fastReduce from "../fastReduce";

test("reduces an array", () => {
  expect(fastReduce([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toBe(15);
});
