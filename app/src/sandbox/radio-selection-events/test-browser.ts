import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
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
