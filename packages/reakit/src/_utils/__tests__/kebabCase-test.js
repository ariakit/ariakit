import kebab from "../kebabCase";

test("converts common cases", () => {
  expect(kebab("foobar")).toBe("foobar");
  expect(kebab("fooBar")).toBe("foo-bar");
  expect(kebab("foo_bar")).toBe("foo-bar");
  expect(kebab("FooBar")).toBe("foo-bar");
  expect(kebab("fooBar")).toBe("foo-bar");
  expect(kebab("foo bar")).toBe("foo-bar");
  expect(kebab("FOO BAR")).toBe("foo-bar");
  expect(kebab("foo-bar")).toBe("foo-bar");
});

test("converts edge cases", () => {
  expect(kebab("____")).toBe("");
  expect(kebab("----")).toBe("");
  expect(kebab("     ")).toBe("");
  expect(kebab("__a__d_")).toEqual("a-d");
});
