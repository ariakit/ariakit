import { withFramework } from "#app/test-utils/preview.ts";

interface FixtureLabels {
  country: string;
  fruit: string;
  loadFruitOptions: string;
  loadRenderedFruitOptions: string;
  renderedFruit: string;
  virtualizedCountry: string;
}

const fixtures: Record<"Combobox" | "Select", FixtureLabels> = {
  Combobox: {
    country: "Country",
    fruit: "Fruit",
    loadFruitOptions: "Load fruit options",
    loadRenderedFruitOptions: "Load rendered fruit options",
    renderedFruit: "Rendered fruit",
    virtualizedCountry: "Virtualized country",
  },
  Select: {
    country: "Legacy Select country",
    fruit: "Legacy Select fruit",
    loadFruitOptions: "Load legacy select fruit options",
    loadRenderedFruitOptions: "Load legacy select rendered fruit options",
    renderedFruit: "Legacy Select rendered fruit",
    virtualizedCountry: "Legacy Select virtualized country",
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

      // https://github.com/ariakit/ariakit/issues/2699
      test("matches custom item content while closed", async ({ page, q }) => {
        await q.combobox(labels.country).focus();

        await page.keyboard.press("c");

        await test.expect(q.combobox(labels.country)).toContainText("Canada");
        await test.expect(q.listbox()).not.toBeAttached();
      });

      // https://github.com/ariakit/ariakit/issues/2699
      test("updates custom item text", async ({ page, q }) => {
        await q.button("Use country aliases").click();
        await q.combobox(labels.country).click();

        await page.keyboard.press("d");

        await test
          .expect(q.option("Canada"))
          .toHaveAttribute("data-active-item");
      });

      // https://github.com/ariakit/ariakit/issues/2699
      test("matches custom content on an offscreen item", async ({
        page,
        q,
      }) => {
        await q.combobox(labels.virtualizedCountry).click();
        await test.expect(q.option("Canada")).toHaveAttribute("data-offscreen");

        await page.keyboard.press("c");

        await test
          .expect(q.option("Canada"))
          .toHaveAttribute("data-active-item");
      });

      // https://github.com/ariakit/ariakit/issues/6733
      test("typeahead updates the value for late unmounted items", async ({
        q,
      }) => {
        await q.button(labels.loadFruitOptions).click();

        const select = q.combobox(labels.fruit);
        await test.expect(select).toBeFocused();
        await test.expect(q.option("Apple")).toHaveCount(0);
        await test
          .expect(q.status(`${labels.fruit} active item`))
          .toHaveText("orange");
        await test.expect(select).toHaveText("Orange");

        await select.press("a");

        await test
          .expect(q.status(`${labels.fruit} active item`))
          .toHaveText("apple");
        await test.expect(select).toHaveText("Apple");
      });

      // https://github.com/ariakit/ariakit/issues/6733
      test("typeahead updates the value for late renderer items", async ({
        q,
      }) => {
        await q.button(labels.loadRenderedFruitOptions).click();

        const select = q.combobox(labels.renderedFruit);
        await test.expect(select).toBeFocused();
        await test.expect(q.option("Apple")).toHaveCount(0);
        await test
          .expect(q.status(`${labels.renderedFruit} active item`))
          .toHaveText("orange");
        await test.expect(select).toHaveText("Orange");

        await select.press("a");

        await test
          .expect(q.status(`${labels.renderedFruit} active item`))
          .toHaveText("apple");
        await test.expect(select).toHaveText("Apple");
      });
    });
  }
});
