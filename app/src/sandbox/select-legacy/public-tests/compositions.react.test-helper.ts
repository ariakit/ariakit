import { click, focus, press, q, type } from "@ariakit/test";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe("public-select-menu-default-open", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select-menu-default-open"));
  });

  // examples/select-menu-default-open/test.ts
  test("opens a newly added Select filter and commits its value", async () => {
    await click(q.button("Filters (0)"));
    await click(q.menuitem("Language"));
    expect(q.combobox("Language filter")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await click(q.option("French"));
    expect(q.combobox("Language filter")).toHaveTextContent("French");
  });
});

describe("public-toolbar-select", () => {
  beforeEach(async () => {
    await click(q.button("Show public-toolbar-select"));
  });

  // examples/toolbar-select/test.ts
  test("participates in toolbar navigation and selects an option", async () => {
    await focus(q.button("Bold"));
    expect(q.button("Bold")).toHaveFocus();
    await press.End();
    const select = q.combobox("Legacy text alignment");
    expect(select).toHaveFocus();
    await press.ArrowDown();
    await press.ArrowDown();
    await press.Enter();
    expect(select).toHaveTextContent("Align Center");
  });
});

describe("public-form-select", () => {
  beforeEach(async () => {
    await click(q.button("Show public-form-select"));
  });

  // examples/form-select/test.ts
  test("integrates a composed legacy Select with Form state", async () => {
    using alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    await type("John", q.textbox("Legacy name"));
    await click(q.combobox("Legacy favorite fruit"));
    await click(q.option("Banana"));
    await click(q.button("Submit legacy custom form"));
    expect(alert).toHaveBeenCalledWith(
      JSON.stringify({ name: "John", fruit: "Banana" }),
    );
  });
});

describe.each([
  ["public-combobox-multiple-select", "Provider multiple legacy fruits"],
  ["public-combobox-multiple-store", "Store multiple legacy fruits"],
])("%s", (caseName, label) => {
  beforeEach(async () => {
    await click(q.button(`Show ${caseName}`));
  });

  // examples/combobox-multiple-select/combobox-multiple.tsx
  // examples/combobox-multiple-store/combobox-multiple.tsx
  test("combines ComboboxItem with multi-selectable SelectItem state", async () => {
    await click(q.combobox(label));
    expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
    await click(q.option("Banana"));
    expect(q.option("Banana")).toHaveAttribute("aria-selected", "true");
    expect(q.listbox()).toBeVisible();
  });
});
