import { expect, test } from "vitest";
import { input } from "./input.ts";

// Regression coverage: the input once hardcoded ak-edge-30 in its base
// class, which silently defeated every $borderWeight value below 30 by
// stylesheet order.
test("expresses the default edge through the overridable variant channel", () => {
  const base = input.html({});
  expect(base.class).not.toContain("ak-edge-30");
  expect(base.class).toContain("ak-edge-alpha-(--border-alpha)");
  expect(base.style).toContain("--border-alpha: calc((30) / 100)");
});

test("numeric and named border weights replace the default edge", () => {
  const soft = input.html({ $borderWeight: 15 });
  expect(soft.style).toContain("--border-alpha: calc((15) / 100)");
  expect(soft.style).not.toContain("calc((30) / 100)");
  const named = input.html({ $borderWeight: "light" });
  expect(named.class).toContain("ak-edge-5");
  expect(named.class).not.toContain("ak-edge-alpha-(--border-alpha)");
});
