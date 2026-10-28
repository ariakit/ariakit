import { withFramework } from "#app/test-utils/preview.ts";

interface FixtureLabels {
  country: string;
  fruit: string;
  loadFruitOptions: string;
  loadRenderedFruitOptions: string;
  renderedFruit: string;
}

const fixtures: Record<"Combobox" | "Select", FixtureLabels> = {
  Combobox: {
    country: "Country",
    fruit: "Fruit",
    loadFruitOptions: "Load fruit options",
    loadRenderedFruitOptions: "Load rendered fruit options",
    renderedFruit: "Rendered fruit",
  },
  Select: {
    country: "Legacy Select country",
    fruit: "Legacy Select fruit",
    loadFruitOptions: "Load legacy select fruit options",
    loadRenderedFruitOptions: "Load legacy select rendered fruit options",
    renderedFruit: "Legacy Select rendered fruit",
  },
};

withFramework(import.meta.dirname, async ({ test }) => {
  for (const [name, labels] of Object.entries(fixtures)) {
    test.describe(name, () => {
      // https://github.com/ariakit/ariakit/issues/2699
      test("matches custom item content and skips empty text while open", async ({
        page,
        q,
      }) => {
        await q.combobox(labels.country).focus();
        await page.keyboard.press("Enter");
        await test
          .expect(q.option("Brazil"))
          .toHaveAttribute("data-active-item");

        await page.keyboard.press("c");

        await test
          .expect(q.option("Citrus"))
          .not.toHaveAttribute("data-active-item");
        await test
          .expect(q.option("Canada"))
          .toHaveAttribute("data-active-item");
      });
    });
  }
});
