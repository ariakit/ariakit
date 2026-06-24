import { withFramework } from "#app/test-utils/preview.ts";

function isApplePlatform(platform: string) {
  return /mac|iphone|ipad|ipod/i.test(platform);
}

// See https://github.com/ariakit/ariakit/issues/6297
withFramework(import.meta.dirname, async ({ test }) => {
  test("paste shortcut on a focused item pastes into the input", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    const combobox = q.combobox("Fruit");
    const apple = q.option("Apple");
    const platform = await page.evaluate(() => navigator.platform);
    const pasteShortcut = isApplePlatform(platform) ? "Meta+V" : "Control+V";

    await combobox.click();
    await page.keyboard.type("b");
    await page.evaluate(() => navigator.clipboard.writeText("Dragonfruit"));
    await page.keyboard.press("ArrowDown");
    await test.expect(apple).toBeFocused();

    await page.keyboard.press(pasteShortcut);
    await test.expect(combobox).toBeFocused();
    await test.expect(q.status()).toContainText("Dragonfruit");
  });
});
