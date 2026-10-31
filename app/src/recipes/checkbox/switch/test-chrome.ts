import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("tabs to each switch and toggles it with Space", async ({ page, q }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.switch("Wi-Fi")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.switch("Bluetooth")).toBeFocused();
    await test.expect(q.switch("Bluetooth")).not.toBeChecked();
    await page.keyboard.press("Space");
    await test.expect(q.switch("Bluetooth")).toBeChecked();
    await page.keyboard.press("Space");
    await test.expect(q.switch("Bluetooth")).not.toBeChecked();
  });
});
