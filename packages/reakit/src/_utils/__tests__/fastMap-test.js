import fastMap from "../fastMap";

test("returns an array", () => {
  expect(fastMap(x => x * 2, [1, 2, 3])).toBeInstanceOf(Array);
});

test("maps simple array", () => {
  expect(fastMap(x => x * 2, [1, 2, 3])).toEqual([2, 4, 6]);
});

test("calls once for each element", () => {
  const mock = jest.fn();
  fastMap(mock, [1, 2, 3, 4, 5, 6]);
  expect(mock).toHaveBeenCalledTimes(6);
});
