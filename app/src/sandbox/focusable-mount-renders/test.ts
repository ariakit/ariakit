import { q } from "@ariakit/test";
import { expect, test } from "vitest";

function getRenderCount(label: string) {
  return Number(q.status.ensure(label).textContent);
}

// The test harness renders in StrictMode, which double-invokes renders, so
// absolute counts are environment-specific. The pinned contract is which
// elements pay the post-mount tag detection render.
test("native button focusable skips the tag detection render on mount", () => {
  // The button's tag traits match the optimistic defaults, so the detection
  // effect bails out without the extra render that the div still pays.
  expect(getRenderCount("Button renders")).toBeLessThan(
    getRenderCount("Div renders"),
  );
});

test("default tag name hint skips the tag detection render on mount", () => {
  // The hinted div's traits are seeded from unstable_defaultTagName, so the
  // detection effect bails out just like it does for native tags.
  expect(getRenderCount("Hinted div renders")).toBe(
    getRenderCount("Button renders"),
  );
});
