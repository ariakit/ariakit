import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names each member on keyboard focus", async () => {
  await press.Tab();
  expect(await q.tooltip.wait("Hana Kobayashi")).toBeVisible();
  await press.Tab();
  expect(await q.tooltip.wait("Tom Becker")).toBeVisible();
  expect(q.tooltip.all()).toHaveLength(1);
});
