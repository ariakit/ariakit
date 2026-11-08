import { invariant } from "@ariakit/utils";
import type { Locator, Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// Half of the default show timeout. A hovercard that closed and opened again
// would take the whole show timeout.
const midwayToShowTimeout = 250;

async function getCenterY(locator: Locator) {
  const box = await locator.boundingBox();
  invariant(box, "The element has no bounding box.");
  return box.y + box.height / 2;
}

// Turns the mouse wheel by the distance that moves `target` under the mouse,
// which rests on `current`.
async function wheelTo(page: Page, current: Locator, target: Locator) {
  const distance = (await getCenterY(target)) - (await getCenterY(current));
  await page.mouse.wheel(0, distance);
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  // Without hoverOnScroll, Playwright WebKit closes this hovercard when the old
  // anchor scrolls out and opens it again on the next anchor after the show
  // timeout, so this test runs in every engine.
  test("move the hovercard without closing it when the old anchor scrolls out", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("Components"));
    // Ariakit resets hover intent on scroll, so the list must be in view before
    // the pointer moves to it.
    await q.navigation("Components").scrollIntoViewIfNeeded();
    await nav.link("Select").hover();
    await test.expect(q.dialog("Select")).toBeVisible();
    await wheelTo(page, nav.link("Select"), nav.link("Tab"));
    await test.expect(nav.link("Select")).not.toBeInViewport();
    // The position update of the old anchor runs on the scroll event, and a
    // close would render in the next frame.
    await flushFrames(page);
    // A hovercard that closed would be hidden until it opened again after the
    // show timeout, so it must be open on the new anchor within half of it.
    await test
      .expect(q.dialog("Tab"))
      .toHaveAttribute("data-open", { timeout: midwayToShowTimeout });
  });
});
