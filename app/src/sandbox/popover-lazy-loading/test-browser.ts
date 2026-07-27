import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const trigger of ["click", "Enter", "Space"] as const) {
    test(`toggles a lazy popover with ${trigger}`, async ({ page, q }) => {
      const disclosure = q.button("Accept invite");
      if (trigger === "click") {
        await disclosure.click();
      } else {
        await disclosure.press(trigger);
      }
      await test.expect(q.dialog("Team meeting")).toBeVisible();
      await test.expect(q.button("Accept")).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      if (trigger === "click") {
        await disclosure.click();
      } else {
        await disclosure.press(trigger);
      }
      await test.expect(q.dialog("Team meeting")).not.toBeVisible();
    });
  }

  test("hides a lazy popover with Escape from disclosure", async ({
    page,
    q,
  }) => {
    await q.button("Accept invite").click();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Team meeting")).not.toBeVisible();
  });

  test("hides a lazy popover with Escape from content", async ({ page, q }) => {
    const disclosure = q.button("Accept invite");
    await disclosure.click();
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Team meeting")).not.toBeVisible();
    await test.expect(disclosure).toBeFocused();
  });
});
