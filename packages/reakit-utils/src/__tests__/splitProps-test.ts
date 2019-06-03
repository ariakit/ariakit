import { splitProps } from "../splitProps";

test("splitProps", () => {
  expect(splitProps({ a: "a", b: "b", c: "c" }, ["b"])).toEqual([
    { b: "b" },
    { a: "a", c: "c" }
  ]);
});
