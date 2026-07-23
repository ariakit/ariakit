import { q, render } from "@ariakit/test/react";
import { expect, test } from "vitest";
import { ListDisclosure } from "./list.react.tsx";

// Regression coverage: a truthiness check passed falsy labels like {0}
// straight through, so the plain DisclosureButton rendered instead of
// ListDisclosureButton and the list indicator defaults were lost.
test("renders falsy labels through the list disclosure button", async () => {
  await render(<ListDisclosure button={0}>content</ListDisclosure>);
  const button = q.button();
  expect(button).toHaveAccessibleName("0");
  const indicator = button?.querySelector("[data-disclosure-indicator]");
  expect(indicator).toBeInTheDocument();
  // The list button places its indicator after the label, unlike the plain
  // disclosure button's start-positioned default.
  expect(button?.firstElementChild).not.toBe(indicator);
});
