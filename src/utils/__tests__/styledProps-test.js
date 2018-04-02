import { bool, value } from "../styledProps";

describe("bool", () => {
  test("fulfilled", () => {
    const props = { foo: true, barBaz: true, baz: false, qux: true };
    const values = ["foo", "barBaz", "baz"];
    expect(bool("a", values)(props)).toBe("a: foo bar-baz;");
  });

  test("empty", () => {
    const props = {};
    const values = [];
    expect(bool("a", values)(props)).toBe("");
  });
});

describe("value", () => {
  test("undefined value", () => {
    const props = {};
    expect(value("foo-bar", "fooBar")(props)).toBe("");
  });

  test("number value", () => {
    const props = { fooBar: 2 };
    expect(value("foo-bar", "fooBar")(props)).toBe("foo-bar: 2px;");
  });

  test("other value", () => {
    const props = { fooBar: "4rem" };
    expect(value("foo-bar", "fooBar")(props)).toBe("foo-bar: 4rem;");
  });
});
