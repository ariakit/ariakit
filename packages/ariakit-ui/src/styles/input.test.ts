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

// Regression coverage: the input once used the ui-hover channel, whose
// nested-interactive exclusion suppressed hover feedback on wrappers whose
// form holds the input next to a submit button.
test("uses plain hover for the field hover feedback", () => {
  const { class: className } = input.html({});
  expect(className).toContain("hover:transition-[background-color]");
  expect(className).toContain("ak-light:hover:ak-state-3");
  expect(className).not.toContain("ui-hover:");
});
