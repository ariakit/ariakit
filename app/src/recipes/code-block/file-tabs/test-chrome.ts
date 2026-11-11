import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("copies the selected file", async ({ context, page, q }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await q.tab("toggle.css").click();
    await test.expect(q.tabpanel("toggle.css")).toBeVisible();
    await q.button("Copy toggle.css").click();
    await test.expect(q.button("Copied")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(copied).toMatch(/^\.toggle \{\n {2}display: grid;/);
  });

  test("moves between files with the arrow keys", async ({ page, q }) => {
    await q.tab("toggle.tsx").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("use-toggle.ts")).toBeFocused();
    await test.expect(q.tabpanel("use-toggle.ts")).toBeVisible();
    await test.expect(q.tabpanel("toggle.tsx")).toBeHidden();
    // The panel is the scroll area of its file, so it is the next tab stop. The
    // copy button shows over the code, so it comes after it.
    await page.keyboard.press("Tab");
    await test.expect(q.tabpanel("use-toggle.ts")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Copy use-toggle.ts")).toBeFocused();
  });
});
