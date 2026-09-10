import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550839
  test("paints the static thumbnail like the active component", async ({
    q,
  }) => {
    const reference = q.option("Reference highlight");
    const resting = q.option("Reference rest");
    // The thumbnail label is inside its content wrapper and item wrapper.
    const thumbnailItem = q.text("John Smith").locator("../..");
    await test.expect(reference).toBeVisible();
    await test.expect(resting).toBeVisible();
    await test.expect(reference).toHaveAttribute("data-active-item");
    await test.expect(thumbnailItem).not.toHaveAttribute("data-active-item");
    const color = await reference.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await test.expect(thumbnailItem).toHaveCSS("background-color", color);
    await test.expect(resting).not.toHaveCSS("background-color", color);
  });
});
