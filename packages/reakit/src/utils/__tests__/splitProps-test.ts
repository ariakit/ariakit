import { unstable_splitProps } from "../splitProps";

test("splitProps", () => {
  expect(unstable_splitProps({ a: "a", b: "b", c: "c" }, ["b"])).toEqual([
    { b: "b" },
    { a: "a", c: "c" }
  ]);
});
