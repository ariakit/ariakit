import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("traps and releases focus in a region", async ({ page, q }) => {
    const checkbox = q.checkbox("Trap region");
    await q.text("Before region").focus();
    await page.keyboard.press("Tab");
    await test.expect(checkbox).toBeFocused();
    await page.keyboard.press("Space");

    await page.keyboard.press("Tab");
    await test.expect(q.button("Region first")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Region second")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.textbox("Region input")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(checkbox).toBeFocused();

    await page.keyboard.press("Space");
    await page.keyboard.press("Tab");
    await test.expect(q.button("Region first")).toBeFocused();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await test.expect(q.text("After region")).toBeFocused();
  });

  test("traps and releases focus with standalone sentinels", async ({
    page,
    q,
  }) => {
    const checkbox = q.checkbox("Trap standalone");
    await q.text("Before standalone").focus();
    await page.keyboard.press("Tab");
    await test.expect(checkbox).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.button("Standalone button")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(checkbox).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Standalone button")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(checkbox).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(q.button("Standalone button")).toBeFocused();

    await checkbox.click();
    await q.button("Standalone button").focus();
    await page.keyboard.press("Tab");
    await test.expect(q.text("After standalone")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(q.button("Standalone button")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(checkbox).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(q.text("Before standalone")).toBeFocused();
  });

  test("focus trap elements participate in tab order", async ({ page, q }) => {
    await q.button("Elements start").focus();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Elements before")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.text("Elements trap")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Elements after")).toBeFocused();
  });

  test("focus trap elements can redirect focus", async ({ page, q }) => {
    await q.button("Redirect start").focus();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Redirect before")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Redirect target")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(q.button("Redirect skip")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(q.button("Redirect target")).toBeFocused();
  });
});
