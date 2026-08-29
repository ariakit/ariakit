import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7315
  test("does not keep the previous disclosure label", async ({ q }) => {
    await q.button("Initial disclosure").click();

    const menu = q.menu();
    await test.expect(menu).toBeVisible();
    await test
      .expect(menu)
      .toHaveAttribute("aria-labelledby", "initial-disclosure");

    await q.button("Replacement disclosure").click();

    await test
      .expect(q.status("Current disclosure"))
      .toHaveText("Replacement disclosure");
    await test
      .expect(menu)
      .not.toHaveAttribute("aria-labelledby", "initial-disclosure");
  });
});
