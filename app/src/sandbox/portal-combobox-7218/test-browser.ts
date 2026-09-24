import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7218
  test("renders a portal inside fullscreen when defaultView is named", async ({
    page,
    q,
  }) => {
    await q.button("Enter portal fullscreen").click();

    // Playwright's text locator reads the document's shadowed defaultView.
    await test.expect
      .poll(() =>
        page.evaluate(() => {
          const content = Array.from(document.querySelectorAll("div")).find(
            (element) =>
              element.childElementCount === 0 &&
              element.textContent?.trim() === "Fullscreen portal content",
          );
          const box = content?.getBoundingClientRect();
          return {
            visible: Boolean(
              content?.checkVisibility({
                opacityProperty: true,
                visibilityProperty: true,
              }) &&
              box &&
              box.width > 0 &&
              box.height > 0,
            ),
            insideFullscreen: Boolean(
              content && document.fullscreenElement?.contains(content),
            ),
          };
        }),
      )
      .toEqual({ visible: true, insideFullscreen: true });
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
