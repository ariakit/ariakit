import { click, press, q } from "@ariakit/test";
import { describe, expect, test } from "vitest";

const labels = ["Fruit", "Vegetable"];

for (const label of labels) {
  describe(label, () => {
    // https://github.com/ariakit/ariakit/issues/7616
    test("a prevented close keeps the moved item active", async () => {
      await click(q.combobox(label));
      expect(q.option(`${label} 1`)).toHaveAttribute("data-active-item");

      await press.ArrowDown();
      expect(q.option(`${label} 2`)).toHaveAttribute("data-active-item");

      await press.Escape();
      expect(q.listbox(label)).toBeVisible();
      expect(q.option(`${label} 2`)).toHaveAttribute("data-active-item");

      // The next move starts from the item that was active before Escape.
      await press.ArrowDown();
      expect(q.option(`${label} 3`)).toHaveAttribute("data-active-item");
    });
  });
}
