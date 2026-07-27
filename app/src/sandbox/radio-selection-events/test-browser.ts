import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("selects basic radios by click", async ({ q }) => {
    const apple = q.radio("Basic apple");
    const orange = q.radio("Basic orange");
    const watermelon = q.radio("Basic watermelon");
    await test.expect(apple).toHaveAttribute("aria-checked", "false");
    await test.expect(orange).toHaveAttribute("aria-checked", "false");
    await test.expect(watermelon).toHaveAttribute("aria-checked", "false");

    await apple.click();
    await test.expect(apple).toBeChecked();
    await test.expect(orange).not.toBeChecked();
    await test.expect(watermelon).not.toBeChecked();

    await watermelon.click();
    await test.expect(apple).not.toBeChecked();
    await test.expect(watermelon).toBeChecked();
  });

  test("focuses and selects the first radio with Tab and Space", async ({
    page,
    q,
  }) => {
    const apple = q.radio("Basic apple");
    await page.keyboard.press("Tab");
    await test.expect(apple).toBeFocused();
    await test.expect(apple).not.toBeChecked();
    await page.keyboard.press("Space");
    await test.expect(apple).toBeFocused();
    await test.expect(apple).toBeChecked();
  });

  for (const key of ["ArrowRight", "ArrowDown"]) {
    test(`moves forward with ${key}`, async ({ page, q }) => {
      await page.keyboard.press("Tab");
      await page.keyboard.press(key);
      await test.expect(q.radio("Basic orange")).toBeFocused();
      await test.expect(q.radio("Basic orange")).toBeChecked();
      await page.keyboard.press(key);
      await test.expect(q.radio("Basic orange")).not.toBeChecked();
      await test.expect(q.radio("Basic watermelon")).toBeFocused();
      await test.expect(q.radio("Basic watermelon")).toBeChecked();
    });
  }

  for (const key of ["ArrowLeft", "ArrowUp"]) {
    test(`moves backward and wraps with ${key}`, async ({ page, q }) => {
      await page.keyboard.press("Tab");
      await page.keyboard.press(key);
      await test.expect(q.radio("Basic watermelon")).toBeFocused();
      await test.expect(q.radio("Basic watermelon")).toBeChecked();
      await page.keyboard.press(key);
      await test.expect(q.radio("Basic watermelon")).not.toBeChecked();
      await test.expect(q.radio("Basic orange")).toBeFocused();
      await test.expect(q.radio("Basic orange")).toBeChecked();
    });
  }

  test("uses the checked default radio as the group tab stop", async ({
    page,
    q,
  }) => {
    await test.expect(q.radio("Default apple")).not.toBeChecked();
    await test.expect(q.radio("Default orange")).toBeChecked();
    await test.expect(q.radio("Default watermelon")).not.toBeChecked();

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await test.expect(q.radio("Default orange")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.radio("Default watermelon")).toBeFocused();
    await test.expect(q.radio("Default watermelon")).toBeChecked();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.radio("Default apple")).toBeFocused();
    await test.expect(q.radio("Default apple")).toBeChecked();
  });

  test("does not change a native radio when focus returns to it", async ({
    page,
    q,
  }) => {
    await q.radio("Native apple").click();
    await test.expect(q.status("Native change count")).toHaveText("1");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await test.expect(q.status("Native change count")).toHaveText("3");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await test.expect(q.status("Native change count")).toHaveText("3");
  });

  test("does not change an already checked custom radio", async ({ q }) => {
    await q.radio("Custom apple").click();
    await test.expect(q.status("Custom change count")).toHaveText("1");
    await q.radio("Custom apple").click();
    await test.expect(q.status("Custom change count")).toHaveText("1");
  });
});
