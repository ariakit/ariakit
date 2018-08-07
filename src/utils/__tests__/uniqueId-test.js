import id from "../uniqueId";

test("multiple calls yield different numbers", () => {
  // eslint-disable-next-line no-self-compare
  expect(id() !== id()).toBeTruthy();
});

test("append args", () => {
  expect(id("foo")).toMatch(/foo\d+/);
});
