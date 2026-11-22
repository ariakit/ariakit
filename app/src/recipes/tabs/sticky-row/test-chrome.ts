import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("names the action of the sidebar button in its tooltip and keeps the button name", async ({
    q,
  }) => {
    const toggle = q.button("Toggle sidebar");
    await toggle.hover();
    await test.expect(q.tooltip("Open sidebar")).toBeVisible();
    await toggle.click();
    await test.expect(toggle).toHaveAttribute("aria-expanded", "true");
    await test.expect(q.tooltip("Close sidebar")).toBeVisible();
  });

  test("shows the name of the new note button in its tooltip", async ({
    q,
  }) => {
    await q.button("New note").hover();
    await test.expect(q.tooltip("New note")).toBeVisible();
  });

  test("reaches the toggle button, the tabs, and the new note button with the Tab key in reading order", async ({
    page,
    q,
  }) => {
    await q.button("Toggle sidebar").focus();
    await page.keyboard.press("Tab");
    await test.expect(q.tab("Trip")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("New note")).toBeFocused();
  });
});
