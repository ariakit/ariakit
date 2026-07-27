import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("toggles disclosure with click, Enter, and Space", async () => {
  const disclosure = q.button("What are vegetables?");
  const content = q.text("Vegetables are parts of plants.");

  expect(content).not.toBeVisible();
  expect(disclosure).toHaveAttribute("aria-expanded", "false");

  await click(disclosure);
  expect(content).toBeVisible();
  expect(disclosure).toHaveAttribute("aria-expanded", "true");

  await press.Enter(disclosure);
  expect(content).not.toBeVisible();
  await press.Enter(disclosure);
  expect(content).toBeVisible();

  await press.Space(disclosure);
  expect(content).not.toBeVisible();
  await press.Space(disclosure);
  expect(content).toBeVisible();
});
