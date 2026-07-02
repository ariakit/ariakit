import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// See https://github.com/ariakit/ariakit/issues/6332
test("panel gains tabindex when switching to a tab without tabbable content", async () => {
  const section = q.within(q.region("Link first"));
  expect(section.tabpanel("Link")).not.toHaveAttribute("tabindex");
  await click(section.tab("Text"));
  expect(section.tabpanel("Text")).toHaveAttribute("tabindex", "0");
  await press.Tab();
  expect(section.tabpanel("Text")).toHaveFocus();
});

test("panel drops tabindex when switching to a tab with tabbable content", async () => {
  const section = q.within(q.region("Text first"));
  expect(section.tabpanel("Text")).toHaveAttribute("tabindex", "0");
  await click(section.tab("Link"));
  expect(section.tabpanel("Link")).not.toHaveAttribute("tabindex");
  await press.Tab();
  expect(section.link("Read the documentation")).toHaveFocus();
});
