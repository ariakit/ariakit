import { click, hover, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the action in the tooltip and keeps the button name", async () => {
  const mute = q.button("Mute");
  expect(mute).toHaveAttribute("aria-pressed", "false");
  await hover(mute);
  expect(await q.tooltip.wait("Mute")).toBeVisible();
  await click(mute);
  expect(mute).toHaveAttribute("aria-pressed", "true");
  expect(await q.tooltip.wait("Unmute")).toBeVisible();
});
