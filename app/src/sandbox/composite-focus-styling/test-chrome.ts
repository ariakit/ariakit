import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("supplements virtual keyboard focus and clears on blur", async ({
    page,
    q,
  }) => {
    const bold = q.button("Virtual Bold");
    const italic = q.button("Virtual Italic");
    await test.expect(bold).toHaveAttribute("data-active-item");
    await test.expect(bold).not.toHaveAttribute("data-focus");
    await bold.focus();
    await test.expect(q.toolbar("Virtual")).toBeFocused();
    await test.expect(bold).toHaveAttribute("data-focus", "true");
    await page.keyboard.press("ArrowRight");
    await test.expect(italic).toHaveAttribute("data-focus", "true");
    await test.expect(bold).not.toHaveAttribute("data-focus");
    await page.keyboard.press("Tab");
    await test.expect(q.button("Remember Virtual Bold")).toBeFocused();
    await test.expect(italic).not.toHaveAttribute("data-focus");
    await test.expect(italic).toHaveAttribute("data-active-item");
  });

  test("uses native CSS for DOM focus", async ({ page, q }) => {
    const bold = q.button("Native Bold");
    await bold.focus();
    await test.expect(bold).toBeFocused();
    await test.expect(bold).not.toHaveAttribute("data-focus");
    await test.expect(bold).toHaveCSS("background-color", "rgb(36, 92, 170)");
    await page.keyboard.press("ArrowRight");
    await test.expect(q.button("Native Italic")).toBeFocused();
    await test
      .expect(q.button("Native Italic"))
      .not.toHaveAttribute("data-focus");
  });

  for (const name of ["Native", "Virtual"]) {
    test(`supplements ${name} hover focus`, async ({ q }) => {
      await q.button("Outside").click();
      const bold = q.button(`${name} Bold`);
      const italic = q.button(`${name} Italic`);
      await bold.hover();
      await test.expect(q.toolbar(name)).toBeFocused();
      await test.expect(bold).toHaveAttribute("data-focus", "true");
      await test.expect(bold).toHaveCSS("background-color", "rgb(36, 92, 170)");
      await italic.hover();
      await test.expect(italic).toHaveAttribute("data-focus", "true");
      await test.expect(bold).not.toHaveAttribute("data-focus");
      await q.button("Outside").hover();
      await test.expect(italic).not.toHaveAttribute("data-focus");
      await test.expect(italic).not.toHaveAttribute("data-active-item");
    });

    test(`does not treat remembered ${name} activity as focus`, async ({
      q,
    }) => {
      const button = q.button(`Remember ${name} Bold`);
      await button.click();
      await test.expect(button).toBeFocused();
      await test
        .expect(q.button(`${name} Bold`))
        .toHaveAttribute("data-active-item");
      await test
        .expect(q.button(`${name} Bold`))
        .not.toHaveAttribute("data-focus");
    });
  }

  test("preserves focus styling on rerender and clears it on item removal", async ({
    page,
    q,
  }) => {
    const bold = q.button("Virtual Bold");
    await bold.focus();
    await test.expect(bold).toHaveAttribute("data-focus", "true");
    await page.keyboard.press("F2");
    await test.expect(q.text("Virtual revision: 1")).toBeVisible();
    await test.expect(bold).toHaveAttribute("data-focus", "true");
    const element = await bold.elementHandle();
    await page.keyboard.press("Delete");
    await test.expect(bold).toHaveCount(0);
    await test.expect
      .poll(() => element?.getAttribute("data-focus"))
      .toBeNull();
    await test.expect(q.toolbar("Virtual")).toBeFocused();
  });

  test("clears focus styling when composite behavior is disabled", async ({
    page,
    q,
  }) => {
    const bold = q.button("Virtual Bold");
    await bold.focus();
    await test.expect(bold).toHaveAttribute("data-focus", "true");
    await page.keyboard.press("Escape");
    await test.expect(bold).not.toHaveAttribute("data-focus");
    await test.expect(bold).toHaveAttribute("data-active-item");
  });

  test("styles a portalled combobox item while the input retains DOM focus", async ({
    page,
    q,
  }) => {
    const input = q.combobox("Fruit");
    await input.click();
    await page.keyboard.press("ArrowDown");
    const apple = q.option("Apple");
    await test.expect(apple).toHaveAttribute("data-focus", "true");
    await test.expect(input).toBeFocused();
    await test.expect(input).not.toHaveAttribute("data-focus");
    await page.keyboard.press("ArrowDown");
    const orange = q.option("Orange");
    await test.expect(orange).toHaveAttribute("data-focus", "true");
    await test.expect(apple).not.toHaveAttribute("data-focus");
    const element = await orange.elementHandle();
    await q.button("Outside").click();
    await test.expect(orange).toHaveCount(0);
    await test.expect
      .poll(() => element?.getAttribute("data-focus"))
      .toBeNull();
  });
});
