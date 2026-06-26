import { q } from "@ariakit/test";
import { expect, test } from "vitest";

const leakedAttributes = [
  "accessiblewhendisabled",
  "clickonenter",
  "clickonspace",
  "focusable",
  "shouldregisteritem",
] as const;

test("omits composite option props from the offscreen placeholder", () => {
  const item = q.button.ensure("Archive");

  expect(item).toHaveAttribute("data-offscreen");
  expect(item).toHaveAttribute("aria-disabled", "true");
  expect(item).not.toHaveAttribute("disabled");

  for (const attribute of leakedAttributes) {
    expect(item).not.toHaveAttribute(attribute);
  }
});
