import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6298
withFramework(import.meta.dirname, async ({ test }) => {
  test("renders overlapping matches without duplicated text", async ({
    page,
    q,
  }) => {
    await q.combobox("Your favorite fruit").click();
    await page.keyboard.type("ana");

    const option = q.option("Banana");
    await test.expect(option).toBeVisible();
    await test.expect(option).toHaveText("Banana");
    await test.expect(option.locator("[data-user-value]")).toHaveCount(1);
    await test
      .expect(option.locator("[data-user-value]"))
      .toHaveText(["anana"]);
    await test.expect(q.status("Normalized empty value")).toHaveText("Cafe");
  });
});
