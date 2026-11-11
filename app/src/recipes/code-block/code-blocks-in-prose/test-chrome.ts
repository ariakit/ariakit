import { isPreviewHydrated } from "#app/lib/preview-hydration.ts";
import { gotoAndSettle, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("restores the saved package manager in every install block", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const [first] = await q.tab("yarn").all();
    await first?.click();
    await gotoAndSettle(page, page.url());
    await page.waitForFunction(isPreviewHydrated);
    for (const tab of await q.tab("yarn").all()) {
      await test.expect(tab).toHaveAttribute("aria-selected", "true");
    }
    // Only the panel of the saved choice shows after the page loads again.
    const panels = q.tabpanel();
    await test.expect(panels).toHaveCount(2);
    await test.expect(panels.first()).toHaveText("yarn add react react-dom");
    await test.expect(panels.last()).toHaveText("yarn add @ariakit/react");
    await q.button("Copy yarn add @ariakit/react").click();
    await test.expect(query(page).button("Copied")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(copied).toBe("yarn add @ariakit/react");
  });
});
