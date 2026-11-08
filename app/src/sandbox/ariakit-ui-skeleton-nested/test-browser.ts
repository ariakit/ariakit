import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("paints the first placeholders of a nested root at once", async ({
    page,
    q,
  }) => {
    const showComments = q.button("Show comments");
    // The button is content of the outer root, so the outer root has shown its
    // content once it is visible.
    await test.expect(showComments).toBeVisible();
    // The comments request stays pending, so their placeholders stay.
    await q.checkbox("Keep loading comments").check();
    await showComments.click();
    const comments = q.region("Comments");
    await test.expect(comments).toHaveAttribute("aria-busy", "true");
    // The placeholders are hidden from assistive technologies, and only the
    // pending marker tells whether they are painted.
    await test.expect(page.locator("[data-pending]")).toHaveCount(0);
    // The shimmer and the fades are animations, and no other page state tells
    // which ones run.
    const getAnimationNames = () =>
      comments.evaluate((element) => [
        ...new Set(
          element
            .getAnimations({ subtree: true })
            .map((animation) =>
              animation instanceof CSSAnimation
                ? animation.animationName
                : animation.constructor.name,
            ),
        ),
      ]);
    await test.expect.poll(getAnimationNames).toContain("ui-skeleton-shimmer");
    // A fade that draws the placeholders would start in the frame after they
    // render, and no page state tracks that frame.
    await flushFrames(page);
    test.expect(await getAnimationNames()).toEqual(["ui-skeleton-shimmer"]);
    // A placeholder that stays transparent with no animation is not painted
    // either.
    await test
      .expect(comments.locator("[aria-hidden='true']").first())
      .toHaveCSS("opacity", "1");
  });
});
