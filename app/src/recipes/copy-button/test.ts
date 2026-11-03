import { click, hover, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the icon button and reports the copy", async () => {
  const copy = q.button("Copy invite code");
  await hover(copy);
  expect(await q.tooltip.wait("Copy invite code")).toBeVisible();
  await click(copy);
  expect(await q.tooltip.wait("Copied")).toBeVisible();
  expect(q.status()).toHaveTextContent("Copied");
  expect(copy).toHaveAccessibleName("Copy invite code");
});
