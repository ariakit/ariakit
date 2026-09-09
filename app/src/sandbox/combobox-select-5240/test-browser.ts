import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223972
  test("keeps the badge size when an optional size is undefined", async ({
    q,
  }) => {
    const defaultStatus = q.combobox("Default status");
    const fontSize = await defaultStatus.evaluate(
      (element) => getComputedStyle(element).fontSize,
    );
    await test
      .expect(q.combobox("Optional status"))
      .toHaveCSS("font-size", fontSize);
    await test
      .expect(q.combobox("Large status"))
      .not.toHaveCSS("font-size", fontSize);
  });
});
