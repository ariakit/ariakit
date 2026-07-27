import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const trigger of ["click", "Enter", "Space"] as const) {
    test(`opens from the disclosure with ${trigger}`, async ({ q }) => {
      const disclosure = q.button("Show modal");
      if (trigger === "click") {
        await disclosure.click();
      } else {
        await disclosure.press(trigger);
      }

      await test.expect(q.dialog("Success")).toBeVisible();
      await test.expect(q.button("OK")).toBeFocused();
    });
  }

  test("makes outside controls inert while the modal is open", async ({
    page,
    q,
  }) => {
    await q.button("Show modal").click();
    await test.expect(q.button("OK")).toBeFocused();

    const outsideIsInert = await q
      .button("Outside dialog")
      .evaluate((element) => !!element.closest("[inert]"));
    test.expect(outsideIsInert).toBe(true);
    await page.keyboard.press("Tab");
    await test.expect(q.button("Outside dialog")).not.toBeFocused();
  });

  test("closes with Escape and restores disclosure focus", async ({
    page,
    q,
  }) => {
    const disclosure = q.button("Show modal");
    await disclosure.click();
    await page.keyboard.press("Escape");

    await test.expect(q.dialog("Success")).not.toBeVisible();
    await test.expect(disclosure).toBeFocused();
  });

  test("closes on outside click without restoring disclosure focus", async ({
    page,
    q,
  }) => {
    const disclosure = q.button("Show modal");
    await disclosure.click();
    await page.mouse.click(1270, 710);

    await test.expect(q.dialog("Success")).not.toBeVisible();
    await test.expect(disclosure).not.toBeFocused();
  });

  for (const trigger of ["click", "Enter", "Space"] as const) {
    test(`closes from the dismiss button with ${trigger}`, async ({ q }) => {
      const disclosure = q.button("Show modal");
      await disclosure.click();
      const dismiss = q.button("OK");

      if (trigger === "click") {
        await dismiss.click();
      } else {
        await dismiss.press(trigger);
      }

      await test.expect(q.dialog("Success")).not.toBeVisible();
      await test.expect(disclosure).toBeFocused();
    });
  }
});
