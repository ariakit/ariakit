import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// See https://github.com/ariakit/ariakit/issues/6346
test("activates the tab selected by setSelectedId after the popover opens", async () => {
  await click(q.combobox.ensure("Grocery"));
  expect(q.tab.ensure("Fruits")).toHaveAttribute("aria-selected", "true");

  await click(q.button.ensure("Browse vegetables"));

  expect(q.tab.ensure("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(q.tab.ensure("Vegetables")).toHaveAttribute("data-active-item");
  expect(q.tab.ensure("Vegetables")).not.toHaveAttribute("tabindex", "-1");

  await click(q.button.ensure("Browse fruits"));

  expect(q.tab.ensure("Fruits")).toHaveAttribute("aria-selected", "true");
  expect(q.tab.ensure("Fruits")).toHaveAttribute("data-active-item");
  expect(q.tab.ensure("Fruits")).not.toHaveAttribute("tabindex", "-1");
});

test("activates the tab selected by setSelectedId after the popover toggles", async () => {
  await click(q.combobox.ensure("Grocery"));
  expect(q.tab.ensure("Fruits")).toHaveAttribute("aria-selected", "true");

  await click(q.button.ensure("Browse vegetables"));
  expect(q.tab.ensure("Vegetables")).toHaveAttribute("aria-selected", "true");

  await click(q.combobox.ensure("Grocery"));
  expect(q.combobox.ensure("Grocery")).toHaveAttribute(
    "aria-expanded",
    "false",
  );

  await click(q.combobox.ensure("Grocery"));
  expect(q.tab.ensure("Fruits")).toHaveAttribute("aria-selected", "true");

  await click(q.button.ensure("Browse vegetables"));

  expect(q.tab.ensure("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(q.tab.ensure("Vegetables")).toHaveAttribute("data-active-item");
  expect(q.tab.ensure("Vegetables")).not.toHaveAttribute("tabindex", "-1");

  await click(q.button.ensure("Browse fruits"));

  expect(q.tab.ensure("Fruits")).toHaveAttribute("aria-selected", "true");
  expect(q.tab.ensure("Fruits")).toHaveAttribute("data-active-item");
  expect(q.tab.ensure("Fruits")).not.toHaveAttribute("tabindex", "-1");
});
