import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("moves between tabs in the original tabs implementation", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox("Search pages");
    await combobox.click();
    await test.expect(q.dialog("Pages")).toBeVisible();
    await test
      .expect(q.tab("Components 16"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(q.tab("Components 16"))
      .not.toHaveAttribute("data-active-item");

    await page.keyboard.press("ArrowDown");
    await test
      .expect(q.tab("Components 16"))
      .toHaveAttribute("data-active-item");
    await page.keyboard.press("ArrowRight");
    await test
      .expect(q.tab("Examples 31"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.tab("Examples 31")).toHaveAttribute("data-active-item");

    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Pages")).toHaveCount(0);
    await test.expect(combobox).toBeFocused();
  });
});
