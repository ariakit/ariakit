import { test } from "#app/test-utils/fixtures.ts";
import { getPlaywrightScreenshotOptions } from "#app/test-utils/visual.ts";

for (const fullPage of [false, true]) {
  // https://github.com/ariakit/ariakit/issues/7752
  test(`keeps ${fullPage ? "document" : "viewport"} capture dimensions stable at fractional positions`, async ({
    page,
    q,
  }) => {
    // Match the overlay's fractional width and 64px capture margin without
    // depending on fonts or the sandbox grid's layout.
    await page.setContent(`
      <body style="margin: 0; height: 2000px">
        <div role="listbox" aria-label="Notifications"
          style="position: absolute; left: 200.25px; top: 600.25px;
            width: 108.5px; height: 80px">
          <div role="option">Email</div>
          <div role="option">SMS</div>
        </div>
      </body>
    `);
    await page.evaluate(() => window.scrollTo(0, 400));
    await test.expect.poll(() => page.evaluate(() => scrollY)).toBe(400);
    const list = q.listbox("Notifications");
    await test.expect(list).toBeVisible();
    for (const offset of [0.25, 0.75]) {
      await list.evaluate((node, offset) => {
        if (!(node instanceof HTMLElement)) {
          throw new Error("Missing listbox element");
        }
        node.style.left = `${200 + offset}px`;
        node.style.top = `${600 + offset}px`;
      }, offset);
      const options = await getPlaywrightScreenshotOptions(page, {
        element: list,
        clipMargin: 64,
        fullPage,
      });
      test.expect(options).toEqual({
        animations: "disabled",
        clip: { x: 136, y: fullPage ? 536 : 136, width: 237, height: 208 },
        fullPage,
      });
    }
  });
}
