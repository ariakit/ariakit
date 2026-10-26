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

test("updates the shared tooltip while it shows", async () => {
  await focus(q.button("Zoom in"));
  const tooltip = await q.tooltip.wait("Zoom in (100%)");
  expect(tooltip).toBeVisible();
  await press.Enter();
  expect(q.tooltip("Zoom in (110%)")).toBe(tooltip);
  await press.ShiftTab();
  expect(await q.tooltip.wait("Zoom out (110%)")).toBe(tooltip);
});
