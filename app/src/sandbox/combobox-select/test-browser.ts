import { withFramework } from "#app/test-utils/preview.ts";

const cases = [
  ["Provider favorite fruit", "Search provider fruits"],
  ["Store favorite fruit", "Search store fruits"],
] as const;

withFramework(import.meta.dirname, async ({ test }) => {
  for (const [label, searchLabel] of cases) {
    test(`${label} auto-selects and restores filtered values`, async ({
      page,
      q,
    }) => {
      const select = q.combobox(label);
      await select.click();
      await page.keyboard.type("cho");
      await test
        .expect(q.option("Chocolate"))
        .toHaveAttribute("data-active-item");
      await page.keyboard.press("Enter");

      await select.click();
      await test
        .expect(q.option("Chocolate"))
        .toHaveAttribute("data-active-item");
      await test.expect(q.combobox(searchLabel)).toHaveValue("");
    });
  }
});
