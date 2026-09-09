import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("honors the small avatar size across two rows", async ({ q }) => {
    await q.combobox("Find records").fill("John");
    const item = q.option(/John Smith/);
    const avatar = item.locator("[aria-hidden]");
    await test.expect(avatar).toBeVisible();
    // Medium occupies 1em per row. A small avatar must stay below that size
    // even when it spans both lines.
    await test.expect
      .poll(() =>
        avatar.evaluate((element) => {
          const height = element.getBoundingClientRect().height;
          const fontSize = Number.parseFloat(
            getComputedStyle(element).fontSize,
          );
          return height / fontSize;
        }),
      )
      .toBeLessThan(2);
  });
});
