import { click, press, q } from "@ariakit/test";
import { describe, expect, test } from "vitest";

interface FixtureLabels {
  accessibleFruit: string;
  ariaDisabledFruit: string;
  fruit: string;
}

const fixtures: Record<"Combobox" | "Select", FixtureLabels> = {
  Combobox: {
    accessibleFruit: "Accessible fruit",
    ariaDisabledFruit: "ARIA disabled fruit",
    fruit: "Fruit",
  },
  Select: {
    accessibleFruit: "Legacy Select accessible fruit",
    ariaDisabledFruit: "Legacy Select ARIA disabled fruit",
    fruit: "Legacy Select fruit",
  },
};

for (const [name, labels] of Object.entries(fixtures)) {
  describe(name, () => {
    // https://github.com/ariakit/ariakit/issues/6347
    test("typeahead skips disabled offscreen select items", async () => {
      await click(q.combobox(labels.fruit));
      expect(q.option("Apple")).toHaveAttribute("data-active-item");
      expect(q.option("Papaya")).toHaveAttribute("data-offscreen");

      await press("p");

      expect(q.option("Papaya")).not.toHaveAttribute("data-active-item");
      expect(q.option("Peach")).toHaveAttribute("data-active-item");
    });

    // https://github.com/ariakit/ariakit/issues/6347
    test("typeahead includes accessible disabled offscreen select items", async () => {
      await click(q.combobox(labels.accessibleFruit));
      expect(q.option("Pawpaw")).toHaveAttribute("data-offscreen");
      expect(q.option("Pawpaw")).toHaveAttribute("aria-disabled", "true");

      await press("p");

      expect(q.option("Pawpaw")).toHaveAttribute("data-active-item");
    });

    // https://github.com/ariakit/ariakit/issues/6347
    test("typeahead skips aria-disabled offscreen select items", async () => {
      await click(q.combobox(labels.ariaDisabledFruit));
      expect(q.option("Papaw")).toHaveAttribute("data-offscreen");
      expect(q.option("Papaw")).toHaveAttribute("aria-disabled", "true");

      await press("p");

      expect(q.option("Papaw")).not.toHaveAttribute("data-active-item");
      expect(q.option("Peach")).toHaveAttribute("data-active-item");
    });
  });
}
