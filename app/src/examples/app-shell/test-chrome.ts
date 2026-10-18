import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("collapses and restores the navigation sidebar", async ({ q }) => {
    const toggle = q.button("Toggle navigation");
    await test.expect(q.navigation("Guides")).toBeVisible();
    await toggle.click();
    await test.expect(toggle).toHaveAttribute("aria-expanded", "false");
    await test.expect(q.navigation("Guides")).not.toBeVisible();
    await toggle.click();
    await test.expect(toggle).toHaveAttribute("aria-expanded", "true");
    await test.expect(q.navigation("Guides")).toBeVisible();
  });
});
