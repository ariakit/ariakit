import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps only the explainable disabled link in the tab order", async ({
    page,
    q,
  }) => {
    await q.button("Before links").focus();
    await page.keyboard.press("Tab");
    await test.expect(q.link("Reachable disabled link")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.button("After links")).toBeFocused();
  });
});
