import fastMap from "../fastMap";

test("returns an array", () => {
  expect(fastMap([1, 2, 3], x => x * 2)).toBeInstanceOf(Array);
});

test("maps simple array", () => {
  expect(fastMap([1, 2, 3], x => x * 2)).toEqual([2, 4, 6]);
});

test("calls once for each element", () => {
  const mock = jest.fn();
  fastMap([1, 2, 3, 4, 5, 6], mock);
  expect(mock).toHaveBeenCalledTimes(6);
});
