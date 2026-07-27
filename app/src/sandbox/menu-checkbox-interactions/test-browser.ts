import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("updates the disclosure label and checkbox values with pointer", async ({
    q,
  }) => {
    await q.button("Unwatch").click();
    await test
      .expect(q.menuitemcheckbox("Issues"))
      .toHaveAttribute("aria-checked", "true");
    await q.menuitemcheckbox("Issues").click();
    await test.expect(q.button("Watch")).toBeVisible();
    await test
      .expect(q.menuitemcheckbox("Issues"))
      .toHaveAttribute("aria-checked", "false");
    await q.menuitemcheckbox("Releases").click();
    await test
      .expect(q.menuitemcheckbox("Releases"))
      .toHaveAttribute("aria-checked", "true");
    await q.menuitemcheckbox("Releases").click();
    await test
      .expect(q.menuitemcheckbox("Releases"))
      .toHaveAttribute("aria-checked", "false");
  });

  for (const key of ["Enter", "Space"] as const) {
    test(`toggles checkbox items with ${key}`, async ({ page, q }) => {
      const button = q.button("Unwatch");
      await button.press(key);
      if (key === "Enter") {
        for (let index = 0; index < 3; index += 1) {
          await page.keyboard.press("ArrowDown");
        }
        const item = q.menuitemcheckbox("Discussions");
        await test.expect(item).toHaveAttribute("aria-checked", "false");
        await page.keyboard.press(key);
        await test.expect(item).toHaveAttribute("aria-checked", "true");
        await page.keyboard.press(key);
        await test.expect(item).toHaveAttribute("aria-checked", "false");
      } else {
        await page.keyboard.press("End");
        const item = q.menuitemcheckbox("Security alerts");
        await test.expect(item).toHaveAttribute("aria-checked", "false");
        await page.keyboard.press(key);
        await test.expect(item).toHaveAttribute("aria-checked", "true");
        await page.keyboard.press(key);
        await test.expect(item).toHaveAttribute("aria-checked", "false");
      }
    });
  }

  test("typeahead focuses a matching checkbox", async ({ page, q }) => {
    await q.button("Unwatch").click();
    await page.keyboard.type("d");
    await test.expect(q.menuitemcheckbox("Discussions")).toBeFocused();
  });
});
