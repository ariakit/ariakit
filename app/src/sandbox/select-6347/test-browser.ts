import { withFramework } from "#app/test-utils/preview.ts";

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

withFramework(import.meta.dirname, async ({ test }) => {
  for (const [name, labels] of Object.entries(fixtures)) {
    test.describe(name, () => {
      // https://github.com/ariakit/ariakit/issues/6347
      test("typeahead skips disabled offscreen select items", async ({
        page,
        q,
      }) => {
        await q.combobox(labels.fruit).click();
        await test
          .expect(q.option("Apple"))
          .toHaveAttribute("data-active-item");
        await test.expect(q.option("Papaya")).toHaveAttribute("data-offscreen");

        await page.keyboard.press("p");

        await test
          .expect(q.option("Papaya"))
          .not.toHaveAttribute("data-active-item");
        await test
          .expect(q.option("Peach"))
          .toHaveAttribute("data-active-item");
      });

      // https://github.com/ariakit/ariakit/issues/6347
      test("typeahead includes accessible disabled offscreen select items", async ({
        page,
        q,
      }) => {
        await q.combobox(labels.accessibleFruit).click();
        await test.expect(q.option("Pawpaw")).toHaveAttribute("data-offscreen");
        await test
          .expect(q.option("Pawpaw"))
          .toHaveAttribute("aria-disabled", "true");

        await page.keyboard.press("p");

        await test
          .expect(q.option("Pawpaw"))
          .toHaveAttribute("data-active-item");
      });

      // https://github.com/ariakit/ariakit/issues/6347
      test("typeahead skips aria-disabled offscreen select items", async ({
        page,
        q,
      }) => {
        await q.combobox(labels.ariaDisabledFruit).click();
        await test.expect(q.option("Papaw")).toHaveAttribute("data-offscreen");
        await test
          .expect(q.option("Papaw"))
          .toHaveAttribute("aria-disabled", "true");

        await page.keyboard.press("p");

        await test
          .expect(q.option("Papaw"))
          .not.toHaveAttribute("data-active-item");
        await test
          .expect(q.option("Peach"))
          .toHaveAttribute("data-active-item");
      });
    });
  }
});
