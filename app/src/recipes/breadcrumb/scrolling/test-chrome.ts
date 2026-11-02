import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // The reversed row must not reverse the steps for the keyboard.
  test("tabs through the steps in source order", async ({ page, q }) => {
    const trail = query(q.navigation("Breadcrumb"));
    await trail.link("Northwind").focus();
    await page.keyboard.press("Tab");
    await test.expect(trail.link("Regional operations")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(trail.link("Distribution centers")).toBeFocused();
  });
});
