import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("arrow keys navigate between radios, not tabs", async ({ page, q }) => {
    // Focus the first radio
    await q.radio("Red").focus();
    await test.expect(q.radio("Red")).toBeFocused();
    // Arrow down should move to next radio, not to next tab
    await page.keyboard.press("ArrowDown");
    await test.expect(q.radio("Green")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.radio("Blue")).toBeFocused();
  });

  test("tab key moves from tab list to radio group", async ({ page, q }) => {
    await q.tab("Preferences").focus();
    await test.expect(q.tab("Preferences")).toBeFocused();
    // Tab should move into the form radio group
    await page.keyboard.press("Tab");
    await test.expect(q.radio("Red")).toBeFocused();
  });
});
