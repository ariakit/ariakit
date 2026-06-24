import { withFramework } from "#app/test-utils/preview.ts";

const shortcuts = [
  { name: "Ctrl+C", press: "Control+C" },
  { name: "Meta+C", press: "Meta+C" },
] as const;

function isApplePlatform(platform: string) {
  return /mac|iphone|ipad|ipod/i.test(platform);
}

// See https://github.com/ariakit/ariakit/issues/6297
withFramework(import.meta.dirname, async ({ test }) => {
  for (const shortcut of shortcuts) {
    test(`${shortcut.name} on a focused item does not commit inline autocomplete`, async ({
      page,
      q,
    }) => {
      const combobox = q.combobox("Fruit");
      const apple = q.option("Apple");

      await combobox.click();
      await page.keyboard.type("b");
      await test.expect(q.status()).toHaveText("b");

      await page.keyboard.press("ArrowDown");
      await test.expect(apple).toBeFocused();
      await test.expect(combobox).toHaveValue("Apple");

      await page.keyboard.press(shortcut.press);
      await test.expect(apple).toBeFocused();
      await test.expect(q.status()).toHaveText("b");
    });
  }

  test("paste shortcut on a focused item moves focus to the input", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox("Fruit");
    const apple = q.option("Apple");
    const platform = await page.evaluate(() => navigator.platform);
    const pasteShortcut = isApplePlatform(platform) ? "Meta+V" : "Control+V";

    await combobox.click();
    await page.keyboard.type("b");
    await page.keyboard.press("ArrowDown");
    await test.expect(apple).toBeFocused();

    await page.keyboard.press(pasteShortcut);
    await test.expect(combobox).toBeFocused();
  });
});
