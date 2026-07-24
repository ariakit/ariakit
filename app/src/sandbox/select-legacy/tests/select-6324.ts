import { click, press, q } from "@ariakit/test";
import { beforeEach, describe, expect, test } from "vitest";

// Registered by the consolidated test entry point.
describe("select-6324", () => {
  beforeEach(async () => {
    await click(q.button("Show select-6324"));
  });

  // https://github.com/ariakit/ariakit/issues/6324
  test("focusOnMove={false} keeps focus while arrow keys move the active item", async () => {
    await click(q.combobox("Fruit"));
    expect(q.option("Apple")).toHaveFocus();

    await press.ArrowDown();

    expect(q.option("Banana")).toHaveAttribute("data-active-item");
    expect(q.option("Apple")).toHaveFocus();
  });
});
