import { withFramework } from "#app/test-utils/preview.ts";

const cases = [
  ["Provider searchable favorite fruit", "Search provider foods"],
  ["Store searchable favorite fruit", "Search store foods"],
] as const;

withFramework(import.meta.dirname, async ({ test }) => {
  for (const [label, searchName] of cases) {
    // examples/select-combobox/test-browser.ts
    // examples/select-combobox-store/test-browser.ts
    test(`${label} filters, selects, and restores the active option`, async ({
      page,
      q,
    }) => {
      const select = q.combobox(label);
      await select.click();
      await test.expect(q.combobox(searchName)).toBeFocused();

      await page.keyboard.type("cho");
      await test
        .expect(q.option("Chocolate"))
        .toHaveAttribute("data-active-item");
      await page.keyboard.press("Enter");
      await test.expect(select).toHaveText("Chocolate");

      await select.click();
      await test
        .expect(q.option("Chocolate"))
        .toHaveAttribute("data-active-item");
      await test.expect(q.option("Chocolate")).toBeInViewport();
    });
  }
});
