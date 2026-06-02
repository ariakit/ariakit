import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("preserves React ref cleanup", async ({ page, q }) => {
    test.setTimeout(60_000);
    await test
      .expect(q.button("Unmount button"))
      .toBeVisible({ timeout: 30_000 });
    await test.expect(q.text("Connected portal content")).toBeVisible();
    await test.expect(q.text("Button object ref attached: yes")).toBeVisible();
    await test
      .expect(q.text("Plain button object ref attached: yes"))
      .toBeVisible();

    await page.keyboard.press("b");
    await test.expect(q.text("Button shortcut count: 1")).toBeVisible();

    await q.button("Unmount button").click();
    await test.expect(q.button("Observed button")).not.toBeVisible();
    await test.expect(q.text("External button detached: yes")).toBeVisible();
    await test.expect(q.text("Button object ref detached: yes")).toBeVisible();
    await page.keyboard.press("b");
    await test.expect(q.text("Button shortcut count: 1")).toBeVisible();

    await q.button("Unmount plain button").click();
    await test.expect(q.button("Plain button")).not.toBeVisible();
    await test.expect(q.text("Plain button detached: yes")).toBeVisible();
    await test
      .expect(q.text("Plain button object ref detached: yes"))
      .toBeVisible();

    await page.keyboard.press("p");
    await test.expect(q.text("Portal shortcut count: 1")).toBeVisible();
    await q.button("Unmount portal").click();
    await test.expect(q.text("Portal content")).not.toBeVisible();
    await page.keyboard.press("p");
    await test.expect(q.text("Portal shortcut count: 1")).toBeVisible();

    await page.keyboard.press("c");
    await test
      .expect(q.text("Connected portal shortcut count: 1"))
      .toBeVisible();
    await q.button("Unmount connected portal").click();
    await test.expect(q.text("Connected portal content")).not.toBeVisible();
    await test.expect(q.text("Connected portal root")).toBeVisible();
    await page.keyboard.press("c");
    await test
      .expect(q.text("Connected portal shortcut count: 1"))
      .toBeVisible();

    await q.button("Unmount non-function portal").click();
    await test.expect(q.text("Non-function portal content")).not.toBeVisible();
    await test
      .expect(q.text("Non-function portal detached: yes"))
      .toBeVisible();
  });
});
