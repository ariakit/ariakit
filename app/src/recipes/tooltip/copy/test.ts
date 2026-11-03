import { click, hover, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("confirms the copy in the tooltip and in the name of the button", async () => {
  const copy = q.button("Copy link");
  await hover(copy);
  expect(await q.tooltip.wait("Copy link")).toBeVisible();
  await click(copy);
  expect(await q.tooltip.wait("Copied")).toBeVisible();
  expect(copy).toHaveAccessibleName("Copied");
});
