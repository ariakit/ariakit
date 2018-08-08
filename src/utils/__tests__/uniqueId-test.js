import uniqueId from "../uniqueId";

test("multiple calls yield different numbers", () => {
  // eslint-disable-next-line no-self-compare
  expect(uniqueId() !== uniqueId()).toBeTruthy();
});

test("append args", () => {
  expect(uniqueId("foo")).toMatch(/foo\d+/);
});
