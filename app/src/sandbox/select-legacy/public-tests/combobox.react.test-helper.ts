import { click, press, q, type } from "@ariakit/test";
import { beforeEach, describe, expect, test } from "vitest";

describe.each([
  [
    "public-select-combobox",
    "Provider searchable favorite fruit",
    "Search provider foods",
  ],
  [
    "public-select-combobox-store",
    "Store searchable favorite fruit",
    "Search store foods",
  ],
])("%s", (caseName, label, searchName) => {
  beforeEach(async () => {
    await click(q.button(`Show ${caseName}`));
  });

  // examples/select-combobox/test.ts
  // examples/select-combobox-store/test.ts
  test("filters and selects through the combined stores", async () => {
    const select = q.combobox(label);
    await click(select);
    expect(q.combobox(searchName)).toHaveFocus();
    await type("gr");
    expect(q.option("Grape")).toHaveFocus();
    await press.Enter();
    expect(select).toHaveTextContent("Grape");
    expect(q.dialog()).not.toBeInTheDocument();
  });
});

describe("public-select-combobox-virtualized", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select-combobox-virtualized"));
  });

  // examples/select-combobox-virtualized/index.react.tsx
  test("selects a filtered item rendered by SelectRenderer", async () => {
    const select = q.combobox("Virtualized legacy country");
    await click(select);
    await type("jama");
    await click(q.option("Jamaica"));
    expect(select).toHaveTextContent("Jamaica");
  });
});

describe.each([
  ["public-select-combobox-tab", "Legacy select with combobox and tab", true],
  [
    "public-select-combobox-tab-manual",
    "Legacy select with combobox and manual tab",
    false,
  ],
])("%s", (caseName, label, selectOnMove) => {
  beforeEach(async () => {
    await click(q.button(`Show ${caseName}`));
  });

  // examples/select-combobox-tab/test.ts
  // examples/select-combobox-tab-various/test.ts
  test("composes Select, Combobox, and tabbed option lists", async () => {
    await click(q.combobox(label));
    expect(q.tab("Branches")).toHaveAttribute("aria-selected", "true");
    await press.ArrowRight();
    expect(q.tab("Tags")).toHaveFocus();
    expect(q.tab("Tags")).toHaveAttribute(
      "aria-selected",
      selectOnMove ? "true" : "false",
    );
    if (!selectOnMove) await press.Enter();
    expect(q.tab("Tags")).toHaveAttribute("aria-selected", "true");
    await press.ArrowDown();
    await click(q.option("v18.2.0"));
    expect(q.combobox(label)).toHaveTextContent("v18.2.0");
  });
});

describe("public-select-combobox-focus-within", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select-combobox-focus-within"));
  });

  // examples/select-combobox-focus-within/test.ts
  test("tracks popover focus and exposes the cancel control", async () => {
    await click(q.combobox("Focus-within favorite fruit"));
    expect(q.group()).toHaveClass("focus-within");
    expect(q.button("Clear input")).toHaveAttribute("data-visible");
    await type("ba");
    expect(q.option("Banana")).toHaveFocus();
    await click(q.button("Clear input"));
    expect(q.combobox("Search focus-within foods")).toHaveValue("");
  });
});

describe("public-select-combobox-offscreen", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select-combobox-offscreen"));
  });

  // examples/select-combobox-offscreen-various/test-chrome.ts
  test("preserves the selected value in the offscreen item composition", async () => {
    const select = q.combobox("Offscreen searchable legacy country");
    expect(select).toHaveTextContent("Dominica");
    await click(select);
    expect(q.option("Dominica")).toHaveAttribute("aria-selected", "true");
  });
});
