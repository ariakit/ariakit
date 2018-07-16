import { hasTransition } from "../transitions";

test("hasTransition", () => {
  expect(hasTransition({})).toBe(false);
  expect(hasTransition({ animated: true })).toBe(true);
  expect(hasTransition({ fade: true })).toBe(true);
  expect(hasTransition({ slide: true })).toBe(true);
  expect(hasTransition({ expand: true })).toBe(true);
  expect(hasTransition({ slide: "top" })).toBe(true);
  expect(hasTransition({ expand: "bottom" })).toBe(true);
});
