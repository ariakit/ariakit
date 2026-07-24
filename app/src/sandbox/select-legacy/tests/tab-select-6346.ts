import { click, q } from "@ariakit/test";
import { beforeEach, describe, expect, test } from "vitest";

// Registered by the consolidated test entry point.
describe("tab-select-6346", () => {
  beforeEach(async () => {
    await click(q.button("Show tab-select-6346"));
  });

  // https://github.com/ariakit/ariakit/issues/6346
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

  // https://github.com/ariakit/ariakit/issues/6346
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
});
