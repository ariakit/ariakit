import fastReduce from "../fastReduce";

test("reduces an array", () => {
  expect(fastReduce((acc, x) => acc + x, 0, [1, 2, 3, 4, 5])).toBe(15);
});
