import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("pressing Enter with no matching items does not submit the form", async ({
    page,
    q,
  }) => {
    await q.combobox("Favorite fruit").click();
    await page.keyboard.type("asdasd");
    await test.expect(q.option("Apple")).toBeHidden();
    await page.keyboard.press("Enter");
    await test.expect(page.getByText("Form submitted")).toBeHidden();
  });

  test("pressing Shift+Enter with no matching items does not submit the form", async ({
    page,
    q,
  }) => {
    await q.combobox("Favorite fruit").click();
    await page.keyboard.type("asdasd");
    await test.expect(q.option("Apple")).toBeHidden();
    await page.keyboard.press("Shift+Enter");
    await test.expect(page.getByText("Form submitted")).toBeHidden();
  });

  test("pressing Enter with a matching item selects it without submitting the form", async ({
    page,
    q,
  }) => {
    await q.combobox("Favorite fruit").click();
    await test.expect(q.option("Apple")).toBeVisible();
    await page.keyboard.press("Enter");
    await test.expect(q.option("Apple")).toBeHidden();
    await test.expect(page.getByText("Form submitted")).toBeHidden();
  });
});
