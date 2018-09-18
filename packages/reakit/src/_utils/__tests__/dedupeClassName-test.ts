import dedupeClassName from "../dedupeClassName";

it("unifies class names", () => {
  expect(dedupeClassName("foo bar foo foo-bar foo-bar")).toBe(
    "foo bar foo-bar"
  );
});

it("handles undefined", () => {
  expect(dedupeClassName()).toBeUndefined();
});
