import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("pointer opens nested menus without toggling an open submenu", async ({
    q,
  }) => {
    const button = q.button("Edit");
    await button.click();
    await test.expect(q.menu("Edit")).toBeVisible();
    await test.expect(q.menu("Find")).not.toBeVisible();
    await q.menuitem("Find").click();
    await test.expect(q.menu("Find")).toBeVisible();
    await test.expect(q.menuitem("Find")).toBeFocused();
    await q.menuitem("Find").click();
    await test.expect(q.menu("Find")).toBeVisible();
    await test.expect(q.menuitem("Find")).toBeFocused();
    await q.menuitem("Find Next").click();
    await test.expect(q.menu("Edit")).not.toBeVisible();
    await test.expect(button).toBeFocused();
  });

  for (const key of ["Enter", "Space"] as const) {
    test(`opens and activates a submenu with ${key}`, async ({ page, q }) => {
      const button = q.button("Edit");
      await button.press(key);
      if (key === "Enter") {
        await page.keyboard.type("f");
        await test.expect(q.menuitem("Find")).toBeFocused();
        await page.keyboard.press(key);
        await test.expect(q.menu("Find")).toBeVisible();
        await test.expect(q.menuitem("Search the Web...")).toBeFocused();
      } else {
        await page.keyboard.type("s");
        await test.expect(q.menuitem("Speech")).toBeFocused();
        await page.waitForTimeout(600);
        await page.keyboard.press(key);
        await test.expect(q.menu("Speech")).toBeVisible();
        await test.expect(q.menuitem("Start Speaking")).toBeFocused();
      }
      await page.keyboard.press(key);
      await test.expect(q.menu("Edit")).not.toBeVisible();
      await test.expect(button).toBeFocused();
    });
  }

  test("horizontal arrows open and close a submenu without wrapping vertically", async ({
    page,
    q,
  }) => {
    await q.button("Edit").press("Enter");
    await page.keyboard.type("f");
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.menu("Find")).not.toBeVisible();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.menu("Find")).toBeVisible();
    await test.expect(q.menuitem("Search the Web...")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.menuitem("Search the Web...")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Find...")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Find Next")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Find Previous")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Find Previous")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.menuitem("Find")).toBeFocused();
    await test.expect(q.menu("Find")).not.toBeVisible();
  });

  test("hover delay opens one submenu and transfers active state", async ({
    q,
  }) => {
    await q.button("Edit").click();
    await q.menuitem("Find").hover();
    await test.expect(q.menuitem("Find")).toBeFocused();
    await test.expect(q.menu("Find")).not.toBeVisible();
    await test.expect(q.menu("Find")).toBeVisible();
    await q.menuitem("Find Next").hover();
    await test.expect(q.menu("Find")).toBeFocused();
    await test
      .expect(q.menuitem("Find Next"))
      .toHaveAttribute("data-active-item");
    await q.menuitem("Speech").hover();
    await test.expect(q.menuitem("Speech")).toBeFocused();
    await test.expect(q.menu("Find")).not.toBeVisible();
    await test.expect(q.menu("Speech")).toBeVisible();
  });

  test("Escape from a submenu closes the full tree", async ({ page, q }) => {
    const button = q.button("Edit");
    await button.click();
    await q.menuitem("Find").click();
    await q.menuitem("Find Next").hover();
    await page.keyboard.press("Escape");
    await test.expect(q.menu("Find")).not.toBeVisible();
    await test.expect(q.menu("Edit")).not.toBeVisible();
    await test.expect(button).toBeFocused();
  });

  test("submenu typeahead cycles matching items", async ({ page, q }) => {
    await q.button("Edit").click();
    await page.keyboard.type("f");
    await page.keyboard.press("Enter");
    await test.expect(q.menuitem("Search the Web...")).toBeFocused();
    await page.keyboard.type("f");
    await test.expect(q.menuitem("Find...")).toBeFocused();
    await page.keyboard.type("fffff");
    await test.expect(q.menuitem("Find Previous")).toBeFocused();
  });

  test("leaving a disabled submenu item clears its parent active state", async ({
    page,
    q,
  }) => {
    await q.button("Edit").click();
    await q.menuitem("Speech").hover();
    await test.expect(q.menu("Speech")).toBeVisible();
    await q.menuitem("Stop Speaking").hover();
    await page.mouse.move(4, 4);
    await test.expect(q.menu("Speech")).not.toBeVisible();
    await test
      .expect(q.menuitem("Speech"))
      .not.toHaveAttribute("data-active-item");
  });
});
