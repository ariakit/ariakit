import { gotoAndSettle, withFramework } from "#app/test-utils/preview.ts";

// React's "Maximum update depth exceeded" error. In production builds React
// throws the minified variant that links to https://react.dev/errors/185.
// See https://github.com/ariakit/ariakit/issues/3214.
const updateDepthError =
  /maximum update depth exceeded|react\.dev\/errors\/185/i;

withFramework(import.meta.dirname, async ({ test }) => {
  test("renders many menus without exceeding React's update depth", async ({
    page,
    q,
  }) => {
    const depthErrors: string[] = [];
    const collect = (text: string) => {
      if (updateDepthError.test(text)) {
        depthErrors.push(text);
      }
    };
    page.on("console", (message) => {
      if (message.type() === "error") collect(message.text());
    });
    page.on("pageerror", (error) => collect(error.message));

    // The error is thrown while the React island hydrates, so re-navigate with
    // the listeners already attached to capture it from the very first render.
    await gotoAndSettle(page, page.url());

    // Confirm the island actually hydrated and the menus still work.
    await q.button("Row 0 actions").click();
    await test.expect(q.menu()).toBeVisible();

    test.expect(depthErrors).toEqual([]);
  });
});
