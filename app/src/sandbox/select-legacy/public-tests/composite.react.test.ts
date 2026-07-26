import { click, focus, hover, press, q } from "@ariakit/test";
import { beforeEach, describe, expect, test } from "vitest";

describe.each([
  ["public-select-animated", "Animated favorite fruit"],
  ["public-select-animated-store", "Animated store favorite fruit"],
])("%s", (caseName, label) => {
  beforeEach(async () => {
    await click(q.button(`Show ${caseName}`));
  });

  // examples/select-animated/test-browser.ts
  // examples/select-animated-store/test-browser.ts
  test("preserves selection across animated show and hide", async () => {
    const select = q.combobox(label);
    await click(select);
    expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
    await press.ArrowDown();
    await press.Enter();
    expect(select).toHaveTextContent("Banana");
    await click(select);
    expect(q.option("Banana")).toHaveAttribute("aria-selected", "true");
  });
});

describe.each([
  ["public-select-grid", "Controlled grid position"],
  ["public-select-grid-store", "Store grid position"],
])("%s", (caseName, label) => {
  beforeEach(async () => {
    await click(q.button(`Show ${caseName}`));
  });

  // examples/select-grid/test.ts
  // examples/select-grid-store/test.ts
  test("moves through the two-dimensional Select composite", async () => {
    const select = q.combobox(label);
    expect(select).toHaveTextContent("Center");
    await click(select);
    expect(q.gridcell("Center")).toHaveFocus();
    await press.ArrowUp();
    expect(q.gridcell("Top Center")).toHaveFocus();
    await press.ArrowLeft();
    expect(q.gridcell("Top Left")).toHaveFocus();
    await press.Enter();
    expect(select).toHaveTextContent("Top Left");
  });
});

describe("public-select-group", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select-group"));
  });

  // examples/select-group/test.ts
  test("moves focus out of an option when hovering a group label", async () => {
    await click(q.combobox("Grouped favorite food"));
    await hover(q.option("Banana"));
    expect(q.option("Banana")).toHaveFocus();
    await hover(q.text("Dairy"));
    expect(q.option("Banana")).not.toHaveFocus();
    expect(q.listbox()).toHaveFocus();
  });
});

describe("public-select-item-custom", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select-item-custom"));
  });

  // examples/select-item-custom/test.ts
  test("renders custom values and restores a moved value on escape", async () => {
    const select = q.combobox("Legacy account");
    expect(select).toHaveTextContent("John Doe");
    await click(select);
    await press.ArrowUp();
    expect(select).toHaveTextContent("Jane Doe");
    await press.Escape();
    expect(select).toHaveTextContent("John Doe");
  });
});

describe("public-select-listbox", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select-listbox"));
  });

  // examples/select-listbox/test.ts
  test("supports the standalone persistent SelectList behavior", async () => {
    await focus(q.listbox());
    expect(q.listbox()).toHaveFocus();
    await press.ArrowDown();
    expect(q.option("Apple")).toHaveFocus();
    await press.ArrowDown();
    expect(q.option("Banana")).toHaveFocus();
    await press.Enter();
    expect(q.option("Banana")).toHaveAttribute("aria-selected", "true");
  });
});
