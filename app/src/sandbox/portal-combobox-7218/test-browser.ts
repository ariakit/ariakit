import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7218
  test("renders a portal inside fullscreen when defaultView is named", async ({
    q,
  }) => {
    await q.button("Enter portal fullscreen").click();

    const content = q.text("Fullscreen portal content");
    await test.expect(content).toBeVisible();
    await test.expect
      .poll(() =>
        content.evaluate((element) =>
          Boolean(element.ownerDocument.fullscreenElement?.contains(element)),
        ),
      )
      .toBe(true);
  });

  // https://github.com/ariakit/ariakit/issues/7218
  test("selects a combobox item when defaultView is named", async ({
    page,
    q,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await q.combobox("Favorite item").click();
    await q.option("Item 24").click();

    await test.expect(q.combobox("Favorite item")).toHaveText("Item 24");
    test.expect(errors).toEqual([]);
  });
});
