import { withFramework } from "#app/test-utils/preview.ts";
import { expectMove, expectNoMove } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // Safari and Firefox on macOS don't focus a button on a click, so only the
  // press itself can stop autoplay there.
  test("stops after a click on the next button", async ({ page, q }) => {
    const region = q.region("Previews");
    const carousel = query(region);
    await carousel.button("Next slide").click();
    await test
      .expect(carousel.button("Start automatic slide show"))
      .toBeVisible();
    await page.mouse.move(0, 0);
    await expectNoMove(page, region);
  });

  test("pauses while the pointer is over a slide iframe", async ({
    page,
    q,
  }) => {
    const region = q.region("Previews");
    await region.locator('iframe[title="Dashboard preview"]').hover();
    await expectNoMove(page, region);
    await page.mouse.move(0, 0);
    await expectMove(region);
  });

  test("pauses while focus is inside a slide iframe", async ({ page, q }) => {
    const region = q.region("Previews");
    const frame = page.frameLocator('iframe[title="Dashboard preview"]');
    // A click moves focus into the iframe without a focus event on the page,
    // which only sees its window blur. The pointer then leaves the carousel, so
    // only focus can keep autoplay paused.
    await frame.getByRole("button", { name: "Edit Dashboard" }).click();
    await page.mouse.move(0, 0);
    await expectNoMove(page, region);
    await q.button("Outside").focus();
    await expectMove(region);
  });
});
