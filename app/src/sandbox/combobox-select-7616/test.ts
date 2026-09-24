import { click, press, q } from "@ariakit/test";
import { describe, expect, test } from "vitest";

const labels = ["Fruit", "Vegetable", "Berry"];

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

    // https://github.com/ariakit/ariakit/issues/7616
    test("a prevented close from the select keeps the moved item active", async () => {
      await click(q.combobox(label));
      await press.ArrowDown();
      expect(q.option(`${label} 2`)).toHaveAttribute("data-active-item");

      await click(q.combobox(label));
      expect(q.listbox(label)).toBeVisible();
      expect(q.option(`${label} 2`)).toHaveAttribute("data-active-item");
      expect(q.text(`${label} closes prevented: 1`)).toBeVisible();
    });

    // https://github.com/ariakit/ariakit/issues/7616
    test("a prevented close from an outside click keeps the moved item active", async () => {
      await click(q.combobox(label));
      await press.ArrowDown();
      expect(q.option(`${label} 2`)).toHaveAttribute("data-active-item");

      await click(document.body);
      expect(q.listbox(label)).toBeVisible();
      expect(q.option(`${label} 2`)).toHaveAttribute("data-active-item");
      expect(q.text(`${label} closes prevented: 1`)).toBeVisible();
    });
  });
}
