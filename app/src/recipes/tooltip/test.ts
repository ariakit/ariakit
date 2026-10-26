import { hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the icon button on hover", async () => {
  await hover(q.button("Notifications"));
  expect(await q.tooltip.wait("Notifications")).toBeVisible();
});

test("shows the tooltip on keyboard focus and hides it on Escape", async () => {
  await press.Tab();
  expect(q.button("Notifications")).toHaveFocus();
  expect(await q.tooltip.wait("Notifications")).toBeVisible();
  await press.Escape();
  expect(q.tooltip.maybe("Notifications")).not.toBeInTheDocument();
  expect(q.button("Notifications")).toHaveFocus();
});
