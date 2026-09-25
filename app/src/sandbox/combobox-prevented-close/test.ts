import { click, press, q, type } from "@ariakit/test";
import { describe, expect, test } from "vitest";

const labels = ["Fruit", "Vegetable", "Berry"];
const linkedLabels = ["Menu", "Dialog"];

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

for (const label of linkedLabels) {
  describe(label, () => {
    // https://github.com/ariakit/ariakit/issues/7621
    test("a prevented close from Enter on an item keeps the search and the active item", async () => {
      await click(q.button(label));
      await type("an");
      expect(q.option("Banana")).toHaveAttribute("data-active-item");

      // Move past the first match, which autoSelect would pick again after a
      // reset.
      await press.ArrowDown();
      expect(q.option("Orange")).toHaveAttribute("data-active-item");

      await press.Enter();
      expect(q.dialog(label)).toBeVisible();
      expect(q.combobox(`${label} search`)).toHaveValue("an");
      expect(q.option("Orange")).toHaveAttribute("data-active-item");
      expect(q.text(`${label} close events: 1`)).toBeVisible();
    });

    // https://github.com/ariakit/ariakit/issues/7621
    test("a prevented close from clicking an item keeps the search and the active item", async () => {
      await click(q.button(label));
      await type("an");
      expect(q.option("Banana")).toHaveAttribute("data-active-item");

      await click(q.option("Orange"));
      expect(q.dialog(label)).toBeVisible();
      expect(q.combobox(`${label} search`)).toHaveValue("an");
      expect(q.option("Orange")).toHaveAttribute("data-active-item");
      expect(q.text(`${label} close events: 1`)).toBeVisible();
    });

    // https://github.com/ariakit/ariakit/issues/7621
    test("an allowed close from Enter on an item closes the popup once", async () => {
      await click(q.checkbox(`Keep ${label} open`));
      await click(q.button(label));
      await type("an");
      await press.ArrowDown();
      expect(q.option("Orange")).toHaveAttribute("data-active-item");

      await press.Enter();
      expect(q.dialog.maybe(label)).not.toBeInTheDocument();
      expect(q.text(`${label} close events: 1`)).toBeVisible();
    });
  });
}
