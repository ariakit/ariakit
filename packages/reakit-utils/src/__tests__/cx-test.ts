import { cx } from "../cx";

test("cx", () => {
  expect(cx("a", "b")).toBe("a b");
  expect(cx("a", null, "b")).toBe("a b");
  expect(cx(false, "")).toBeUndefined();
});
