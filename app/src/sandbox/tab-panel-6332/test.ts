import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// See https://github.com/ariakit/ariakit/issues/6332
test("panel gains tabindex when switching to a tab without tabbable content", async () => {
  const section = q.within(q.region.ensure("Link first"));
  expect(section.tabpanel.ensure("Link")).not.toHaveAttribute("tabindex");
  await click(section.tab.ensure("Text"));
  expect(section.tabpanel.ensure("Text")).toHaveAttribute("tabindex", "0");
  await press.Tab();
  expect(section.tabpanel.ensure("Text")).toHaveFocus();
});

test("panel drops tabindex when switching to a tab with tabbable content", async () => {
  const section = q.within(q.region.ensure("Text first"));
  expect(section.tabpanel.ensure("Text")).toHaveAttribute("tabindex", "0");
  await click(section.tab.ensure("Link"));
  expect(section.tabpanel.ensure("Link")).not.toHaveAttribute("tabindex");
  await press.Tab();
  expect(section.link.ensure("Read the documentation")).toHaveFocus();
});
