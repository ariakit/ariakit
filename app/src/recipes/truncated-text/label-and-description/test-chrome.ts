import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows both texts while either one is cut off", async ({ page, q }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.button(/^Q3 report\.pdf/)).toBeFocused();
    // Keyboard focus shows a tooltip in the commit after the focus, and no
    // state tracks a tooltip that stays closed, so cross the frames that would
    // render it.
    await flushFrames(page);
    await test.expect(q.tooltip()).toHaveCount(0);
    // The label is cut off.
    await page.keyboard.press("Tab");
    await test
      .expect(q.tooltip(/^Revenue forecast .+ Edited yesterday$/))
      .toBeVisible();
    // Only the description is cut off.
    await page.keyboard.press("Tab");
    await test
      .expect(q.tooltip(/^Interview notes\.md .+ Lisbon office$/))
      .toBeVisible();
  });
});
