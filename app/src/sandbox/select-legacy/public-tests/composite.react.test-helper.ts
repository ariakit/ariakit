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

describe("public-select-collapsed-hover", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select-collapsed-hover"));
  });

  // https://github.com/ariakit/ariakit/issues/7120
  // The authored focusOnHover callback moves the composite from inside the
  // predicate. While the select is collapsed, the callback must not run at
  // all, or the move would still activate the item, commit its value, and
  // steal focus from the unrelated control.
  test("a side-effectful focusOnHover callback does nothing on a collapsed list", async () => {
    const select = q.combobox("Collapsed hover fruit");
    const grape = q.option("Grape");
    const other = q.button("Collapsed hover other control");

    await click(other);
    expect(other).toHaveFocus();

    // `hover` settles the DOM before resolving, so the assertions below run
    // after any activation the mousemove handler committed.
    await hover(grape);

    expect(select).toHaveAttribute("aria-expanded", "false");
    expect(grape).not.toHaveAttribute("data-active-item");
    expect(select).toHaveTextContent("Apple");
    expect(other).toHaveFocus();
  });

  // https://github.com/ariakit/ariakit/issues/7120
  // The gate is about the closed list: the same side-effectful callback
  // keeps working once the select opens.
  test("the same callback activates the option once the select opens", async () => {
    const select = q.combobox("Collapsed hover fruit");
    const grape = q.option("Grape");

    await click(select);
    expect(select).toHaveAttribute("aria-expanded", "true");

    await hover(grape);

    expect(grape).toHaveAttribute("data-active-item");
  });
});

describe("public-select-listbox", () => {
  beforeEach(async () => {
    await click(q.button("Show public-select-listbox"));
  });

  // examples/select-listbox/test.ts
  test("focuses the persistent listbox", async () => {
    await focus(q.listbox());
    expect(q.listbox()).toHaveFocus();
    expect(q.option("Apple")).not.toHaveFocus();
  });

  test("moves through items with arrow keys", async () => {
    await focus(q.listbox());
    await press.ArrowDown();
    expect(q.option("Apple")).toHaveFocus();
    expect(q.option("Apple")).toHaveAttribute("data-active-item");
    expect(q.option("Apple")).toHaveAttribute("data-focus-visible");
    expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
    await press.ArrowDown();
    expect(q.option("Banana")).toHaveFocus();
    expect(q.option("Banana")).toHaveAttribute("data-active-item");
    expect(q.option("Banana")).toHaveAttribute("data-focus-visible");
    expect(q.option("Banana")).toHaveAttribute("aria-selected", "false");
  });

  test("moves with arrow keys after clicking an item", async () => {
    await click(q.option("Apple"));
    expect(q.listbox()).toHaveFocus();
    expect(q.option("Apple")).toHaveFocus();
    expect(q.option("Apple")).toHaveAttribute("data-active-item");
    expect(q.option("Apple")).not.toHaveAttribute("data-focus-visible");
    await press.ArrowDown();
    expect(q.option("Banana")).toHaveFocus();
    expect(q.option("Banana")).toHaveAttribute("data-active-item");
    expect(q.option("Banana")).toHaveAttribute("data-focus-visible");
  });

  test("selects items with the keyboard", async () => {
    await focus(q.listbox());
    await press.ArrowDown();
    await press.ArrowDown();
    await press.ArrowDown();
    await press.Enter();
    expect(q.listbox()).toHaveFocus();
    expect(q.option("Orange")).toHaveFocus();
    expect(q.option("Orange")).toHaveAttribute("data-active-item");
    expect(q.option("Orange")).toHaveAttribute("data-focus-visible");
    expect(q.option("Orange")).toHaveAttribute("aria-selected", "true");
    await press.Home();
    await press.Space();
    expect(q.option("Apple")).toHaveFocus();
    expect(q.option("Apple")).toHaveAttribute("data-active-item");
    expect(q.option("Apple")).toHaveAttribute("data-focus-visible");
    expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  });
});
