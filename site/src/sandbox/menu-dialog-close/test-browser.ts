import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("open/close menu by clicking on menu button", async ({ q }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog()).toBeVisible();
    await q.button("Menu").click();
    await test.expect(q.menu()).toBeVisible();
    await q.button("Menu").click();
    await test.expect(q.menu()).not.toBeVisible();
    await test.expect(q.dialog()).toBeVisible();
  });

  test("menu button receives focus after menu closes", async ({ q }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog()).toBeVisible();
    const menuButton = q.button("Menu");
    await menuButton.click();
    await test.expect(q.menu()).toBeVisible();
    await menuButton.click();
    await test.expect(q.menu()).not.toBeVisible();
    await test.expect(menuButton).toBeFocused();
  });
});
