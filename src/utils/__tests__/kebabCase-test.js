import kebab from "../kebabCase";

test("converts common cases", () => {
  expect(kebab("foobar")).toEqual("foobar");
  expect(kebab("fooBar")).toEqual("foo-bar");
  expect(kebab("foo_bar")).toEqual("foo-bar");
  expect(kebab("FooBar")).toEqual("foo-bar");
  expect(kebab("fooBar")).toEqual("foo-bar");
  expect(kebab("foo bar")).toEqual("foo-bar");
  expect(kebab("FOO BAR")).toEqual("foo-bar");
  expect(kebab("foo-bar")).toEqual("foo-bar");
});

test("converts edge cases", () => {
  expect(kebab("____").length).toEqual(0);
  expect(kebab("----").length).toEqual(0);
  expect(kebab("     ").length).toEqual(0);
  expect(kebab("__a__d_")).toEqual("a-d");
});
