import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names each member on keyboard focus", async () => {
  await press.Tab();
  expect(await q.tooltip.wait("Ada Lovelace")).toBeVisible();
  await press.Tab();
  expect(await q.tooltip.wait("Grace Hopper")).toBeVisible();
  expect(q.tooltip.all()).toHaveLength(1);
});
