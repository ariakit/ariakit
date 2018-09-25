import callMeMaybe from "../callMeMaybe";

test("callMeMaybe", () => {
  const fn = jest.fn(v => v);
  expect(callMeMaybe(fn, "foo")).toBe("foo");
  expect(callMeMaybe("foo")).toBe("foo");
  expect(fn).toBeCalledTimes(1);
});
