import { splitProps } from "../splitProps";

test("splitProps backward compatibility", () => {
  expect(splitProps({ a: "a", b: "b", c: "c" }, ["b"])).toEqual([
    { b: "b" },
    { a: "a", c: "c" },
  ]);
});

test("splitProps options passed as state object", () => {
  expect(
    splitProps({ state: { a: "aa" }, a: "a", b: "b", c: "c" }, ["b"])
  ).toEqual([{ a: "aa" }, { a: "a", b: "b", c: "c" }]);
});
