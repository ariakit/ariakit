import { withFramework } from "#app/test-utils/preview.ts";

const cases = [
  ["Automatic tabs", true],
  ["Manual tabs", false],
] as const;

withFramework(import.meta.dirname, async ({ test }) => {
  for (const [label, selectOnMove] of cases) {
    // examples/select-combobox-tab/test.ts
    // examples/select-combobox-tab-various/test.ts
    test(`${label} composes Select, Combobox, and tabs`, async ({
      page,
      q,
    }) => {
      await q.combobox(label).click();
      await test
        .expect(q.tab("Branches"))
        .toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("ArrowRight");
      await test.expect(q.tab("Tags")).toHaveAttribute("data-active-item");
      await test
        .expect(q.tab("Tags"))
        .toHaveAttribute("aria-selected", selectOnMove ? "true" : "false");
      if (!selectOnMove) {
        await page.keyboard.press("Enter");
      }
      await q.option("v18.2.0").click();
      await test.expect(q.combobox(label)).toHaveText("v18.2.0");
    });
  }
});
