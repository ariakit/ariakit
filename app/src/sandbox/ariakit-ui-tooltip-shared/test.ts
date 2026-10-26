import { focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("moves the shared tooltip with Tab and hides it on Escape", async () => {
  const section = q.within(q.region("Slide"));
  await focus(section.button("One"));
  expect(await q.tooltip.wait("One tooltip")).toBeVisible();
  await press.Tab();
  expect(section.button("Two")).toHaveFocus();
  expect(await q.tooltip.wait("Two tooltip")).toBeVisible();
  expect(q.tooltip.all()).toHaveLength(1);
  await press.Escape();
  expect(q.tooltip.maybe("Two tooltip")).not.toBeInTheDocument();
  expect(section.button("Two")).toHaveFocus();
});
