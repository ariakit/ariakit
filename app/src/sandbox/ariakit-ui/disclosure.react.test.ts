import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";
import { mountExamples } from "./mount.react.test-helper.ts";
import { DisclosureExamples } from "./pages/disclosure.react.tsx";

mountExamples(DisclosureExamples);

test("shares the open state of a controlled disclosure with an outside button", async () => {
  const example = q.within(q.article("Controlled"));
  const toggle = example.button("Toggle delivery details");
  const button = example.button("Delivery details");
  const contentId = toggle.getAttribute("aria-controls");
  expect(contentId).toBeTruthy();
  expect(button).toHaveAttribute("aria-controls", contentId);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(button).toHaveAttribute("aria-expanded", "false");

  await click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(
    example.text("Standard delivery takes three to five business days."),
  ).toBeVisible();

  await click(button);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(button).toHaveAttribute("aria-expanded", "false");
});

test("labels and describes a button that has both", () => {
  const button = q.within(q.article("Description")).button("Billing");
  expect(button).toHaveAccessibleDescription(
    "Manage the cards on this account",
  );
});
