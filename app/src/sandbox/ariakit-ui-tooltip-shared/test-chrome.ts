import { tabTo } from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("moves the shared tooltip with Tab and hides it on Escape", async ({
    page,
    q,
  }) => {
    const section = q.region("Slide");
    await tabTo(page, query(section).button("One"));
    await test.expect(q.tooltip("One tooltip")).toBeVisible();
    await page.keyboard.press("Tab");
    await test.expect(query(section).button("Two")).toBeFocused();
    await test.expect(q.tooltip("Two tooltip")).toBeVisible();
    await test.expect(q.tooltip()).toHaveCount(1);
    await page.keyboard.press("Escape");
    await test.expect(q.tooltip("Two tooltip")).toBeHidden();
    await test.expect(query(section).button("Two")).toBeFocused();
  });
});
