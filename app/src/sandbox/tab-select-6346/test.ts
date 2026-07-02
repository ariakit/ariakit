import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// See https://github.com/ariakit/ariakit/issues/6346
test("activates the tab selected by setSelectedId after the popover opens", async () => {
  await click(q.combobox("Grocery"));
  expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");

  await click(q.button("Browse vegetables"));

  expect(q.tab("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("Vegetables")).toHaveAttribute("data-active-item");
  expect(q.tab("Vegetables")).not.toHaveAttribute("tabindex", "-1");

  await click(q.button("Browse fruits"));

  expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("Fruits")).toHaveAttribute("data-active-item");
  expect(q.tab("Fruits")).not.toHaveAttribute("tabindex", "-1");
});

test("activates the tab selected by setSelectedId after the popover toggles", async () => {
  await click(q.combobox("Grocery"));
  expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");

  await click(q.button("Browse vegetables"));
  expect(q.tab("Vegetables")).toHaveAttribute("aria-selected", "true");

  await click(q.combobox("Grocery"));
  expect(q.combobox("Grocery")).toHaveAttribute("aria-expanded", "false");

  await click(q.combobox("Grocery"));
  expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");

  await click(q.button("Browse vegetables"));

  expect(q.tab("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("Vegetables")).toHaveAttribute("data-active-item");
  expect(q.tab("Vegetables")).not.toHaveAttribute("tabindex", "-1");

  await click(q.button("Browse fruits"));

  expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("Fruits")).toHaveAttribute("data-active-item");
  expect(q.tab("Fruits")).not.toHaveAttribute("tabindex", "-1");
});
