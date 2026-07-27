import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the hovercard after hovering", async ({ q }) => {
    await q.link("@ariakit.com").hover();
    await test.expect(q.dialog("Ariakit")).toBeVisible();
  });

  test("keeps the disclosure hidden after mouse focus", async ({ q }) => {
    const disclosure = q.button(/^More details/);
    await q.link("@ariakit.com").click();
    await test.expect(disclosure).toHaveCSS("height", "1px");
  });

  test("shows and focuses the disclosure with the keyboard", async ({
    page,
    q,
  }) => {
    const disclosure = q.button(/^More details/);
    await page.keyboard.press("Tab");
    await test.expect(disclosure).not.toHaveCSS("height", "1px");
    await page.keyboard.press("Tab");
    await test.expect(disclosure).toBeFocused();
  });

  for (const trigger of ["click", "Enter", "Space"] as const) {
    test(`toggles the hovercard disclosure with ${trigger}`, async ({
      page,
      q,
    }) => {
      const disclosure = q.button(/^More details/);
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      if (trigger === "click") {
        await disclosure.click();
      } else {
        await disclosure.press(trigger);
      }
      await test.expect(q.dialog("Ariakit")).toBeVisible();
      await test.expect(q.link("Follow")).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      if (trigger === "click") {
        await disclosure.click();
      } else {
        await disclosure.press(trigger);
      }
      await test.expect(q.dialog("Ariakit")).not.toBeVisible();
      await test.expect(disclosure).toBeFocused();
    });
  }

  test("Escape restores focus to the anchor", async ({ page, q }) => {
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Ariakit")).not.toBeVisible();
    await test.expect(q.link("@ariakit.com")).toBeFocused();
  });

  test("hovering after disclosure use does not autofocus the card", async ({
    page,
    q,
  }) => {
    const anchor = q.link("@ariakit.com");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    await anchor.hover();
    await test.expect(q.dialog("Ariakit")).toBeVisible();
    await test.expect(anchor).toBeFocused();
  });

  test("hides the disclosure when keyboard focus leaves", async ({
    page,
    q,
  }) => {
    const disclosure = q.button(/^More details/);
    await page.keyboard.press("Tab");
    await test.expect(disclosure).not.toHaveCSS("height", "1px");
    await page.keyboard.press("Tab");
    await test.expect(disclosure).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("After profile")).toBeFocused();
    await test.expect(disclosure).toHaveCSS("height", "1px");
    await page.keyboard.press("Shift+Tab");
    await test.expect(disclosure).not.toHaveCSS("height", "1px");
    await page.keyboard.press("Shift+Tab");
    await test.expect(disclosure).not.toHaveCSS("height", "1px");
  });
});
