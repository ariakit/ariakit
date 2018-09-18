import uniqueClassName from "../uniqueClassName";

it("unifies class names", () => {
  expect(uniqueClassName("foo bar foo foo-bar foo-bar")).toBe(
    "foo bar foo-bar"
  );
});

it("handles undefined", () => {
  expect(uniqueClassName()).toBeUndefined();
});
