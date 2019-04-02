import { ref } from "../ref";

test("ref", () => {
  expect(ref("a")({ a: "b" })).toBe("b");
});
