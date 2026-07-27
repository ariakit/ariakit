import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("toggles provider popover with click, Enter, and Space", async ({
    page,
    q,
  }) => {
    const disclosure = q.button("Accept invite");
    const popover = q.dialog("Team meeting");

    await test.expect(popover).not.toBeVisible();
    await disclosure.click();
    await test.expect(popover).toBeVisible();
    await test.expect(q.button("Accept")).toBeFocused();
    await disclosure.click();
    await test.expect(popover).not.toBeVisible();
    await test.expect(disclosure).toBeFocused();

    await disclosure.press("Enter");
    await test.expect(popover).toBeVisible();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Enter");
    await test.expect(popover).not.toBeVisible();

    await disclosure.press("Space");
    await test.expect(popover).toBeVisible();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Space");
    await test.expect(popover).not.toBeVisible();
  });

  test("hides provider popover with Escape from disclosure and content", async ({
    page,
    q,
  }) => {
    const disclosure = q.button("Accept invite");
    const popover = q.dialog("Team meeting");

    await disclosure.click();
    await page.keyboard.press("Shift+Tab");
    await test.expect(popover).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(popover).not.toBeVisible();

    await disclosure.click();
    await test.expect(q.button("Accept")).toBeFocused();
    await page.keyboard.press("Escape");
    await test.expect(popover).not.toBeVisible();
    await test.expect(disclosure).toBeFocused();
  });

  test("controlled standalone popover closes through onClose", async ({
    q,
  }) => {
    const disclosure = q.button("Review invite");
    const popover = q.dialog("Review meeting");

    await disclosure.click();
    await test.expect(popover).toBeVisible();
    await q.button("Confirm").press("Escape");
    await test.expect(popover).not.toBeVisible();
    await test.expect(disclosure).toBeFocused();
  });

  for (const trigger of ["click", "Enter", "Space"] as const) {
    test(`toggles controlled standalone popover with ${trigger}`, async ({
      page,
      q,
    }) => {
      const disclosure = q.button("Review invite");
      if (trigger === "click") {
        await disclosure.click();
      } else {
        await disclosure.press(trigger);
      }
      await test.expect(q.dialog("Review meeting")).toBeVisible();
      await test.expect(q.button("Confirm")).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      if (trigger === "click") {
        await disclosure.click();
      } else {
        await disclosure.press(trigger);
      }
      await test.expect(q.dialog("Review meeting")).not.toBeVisible();
    });
  }

  test("hides controlled standalone popover with Escape from disclosure", async ({
    page,
    q,
  }) => {
    await q.button("Review invite").click();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Review meeting")).not.toBeVisible();
  });

  test("does not scroll when opening the controlled popover", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await page.evaluate(() => {
      document.body.style.paddingTop = "250px";
      window.scrollTo({ top: 250 });
    });
    await q.button("Review invite").focus();
    await page.keyboard.press("Enter");
    await test.expect(q.dialog("Review meeting")).toBeVisible();
    await test.expect(q.button("Confirm")).toBeFocused();
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(250);
  });
});
