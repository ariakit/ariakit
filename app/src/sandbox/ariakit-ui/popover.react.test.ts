import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";
import { mountExamples } from "./mount.react.test-helper.ts";
import { PopoverExamples } from "./pages/popover.react.tsx";

mountExamples(PopoverExamples);

// The popovers held open on this page mark every popover that already exists
// when they open as outside them, and Ariakit then ignores Escape on it. The
// live popover renders in a portal and mounts on open to avoid the marks.
// https://github.com/ariakit/ariakit/issues/7463
test("closes the live popover on Escape while others are held open", async () => {
  const disclosure = q.button("Event details");
  await click(disclosure);
  const popover = q.dialog("Design review");
  expect(q.within(popover).button("Close")).toHaveFocus();
  expect(q.within(q.article("Opened on click")).dialog.maybe()).toBeNull();
  await press.Escape();
  expect(q.dialog.maybe("Design review")).not.toBeInTheDocument();
  expect(disclosure).toHaveFocus();
  const held = q.within(q.article("Default")).dialog("Team meeting");
  expect(held).toBeVisible();
});

test("names a dismiss without children and closes the popover with it", async () => {
  const box = q.within(q.article("Close button"));
  expect(box.dialog("Notifications")).toBeVisible();
  await click(box.button("Dismiss popup"));
  expect(box.dialog.maybe("Notifications")).not.toBeInTheDocument();
  await click(box.button("Notifications"));
  expect(box.dialog("Notifications")).toBeVisible();
});

test("names the popover without a heading from its label", () => {
  const box = q.within(q.article("Compact frame"));
  expect(box.dialog("Share")).toHaveAccessibleDescription(
    "Anyone with the link can view.",
  );
});
