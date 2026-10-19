import { gotoAndSettle, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7986
  test("prerenders and hydrates composite-derived stores", async ({
    page,
    q,
  }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });
    page.on("pageerror", (error) => errors.push(error.message));

    // Re-navigate with listeners attached to capture prerender and hydration
    // errors.
    await gotoAndSettle(page, page.url());

    await q.tab("Activity").click();
    await test.expect(q.tabpanel("Activity")).toHaveText("Recent changes");
    await q.tab("Details").click();
    await test.expect(q.tabpanel("Details")).toHaveText("Report details");
    await q.button("Bold").click();
    await test.expect(q.button("Bold")).toBeFocused();
    await q.button("Actions").click();
    await test.expect(q.menuitem("Rename")).toBeVisible();
    await page.keyboard.press("Escape");
    await q.menuitem("File").click();
    await test.expect(q.menuitem("New file")).toBeVisible();
    await page.keyboard.press("Escape");
    await q.button("List").click();
    await test.expect(q.button("List")).toBeFocused();
    await test.expect(q.text("Workspace store: workspace-store")).toBeVisible();
    test.expect(errors).toEqual([]);
  });
});
