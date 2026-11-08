import { invariant } from "@ariakit/utils";
import type { Locator, Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// After a scroll, Playwright WebKit sends a mousemove whose screen position
// differs from its real moves, so the mouse hover moves, opens, and hides the
// popups there whether a scroll counts as hover or not. Chrome and Firefox send
// no mousemove after a scroll, so these tests run only there.

// The default hide timeout. Nothing shows a pending hide.
const hideTimeout = 500;

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
  test("move an open hovercard to the anchor that a scroll moves under the mouse", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("Components"));
    // Ariakit resets hover intent on scroll, so the list must be in view before
    // the pointer moves to it.
    await q.navigation("Components").scrollIntoViewIfNeeded();
    await nav.link("Checkbox").hover();
    await test.expect(q.dialog("Checkbox")).toBeVisible();
    await wheelTo(page, nav.link("Checkbox"), nav.link("Select"));
    await test.expect(q.dialog("Select")).toBeVisible();
  });

  test("open a closed hovercard when a scroll moves an anchor under the mouse", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("Components"));
    await q.navigation("Components").scrollIntoViewIfNeeded();
    await nav.heading("Overlays").hover();
    await test.expect(q.dialog()).toHaveCount(0);
    await wheelTo(page, nav.heading("Overlays"), nav.link("Dialog"));
    await test.expect(q.dialog("Dialog")).toBeVisible();
  });

  test("hide the hovercard when a scroll leaves no anchor under the mouse", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("Components"));
    await q.navigation("Components").scrollIntoViewIfNeeded();
    await nav.link("Slider").hover();
    await test.expect(q.dialog("Slider")).toBeVisible();
    await wheelTo(page, nav.link("Slider"), nav.heading("Overlays"));
    await test.expect(q.dialog("Slider")).toBeHidden();
  });

  test("move the hovercard when a scroll moves a nested anchor under the mouse", async ({
    page,
    q,
  }) => {
    const inbox = query(q.region("Inbox"));
    await q.region("Inbox").scrollIntoViewIfNeeded();
    // The button is a tooltip anchor inside the message, which is a hovercard
    // anchor, so the mouse hovers both.
    await inbox.button("Archive Meeting").hover();
    await test.expect(q.dialog("Meeting")).toBeVisible();
    await wheelTo(
      page,
      inbox.button("Archive Meeting"),
      inbox.button("Archive Release"),
    );
    await test.expect(q.dialog("Release")).toBeVisible();
  });

  // The hovercard's own hoverOnScroll accepts the list scroll, while the
  // tooltip's on the same element rejects it.
  test("hide the hovercard by its own callback when its anchor is also a tooltip anchor", async ({
    page,
    q,
  }) => {
    const authors = query(q.region("Authors"));
    await q.region("Authors").scrollIntoViewIfNeeded();
    await authors.link("Dan").hover();
    await test.expect(q.dialog("Dan")).toBeVisible();
    await wheelTo(page, authors.link("Dan"), authors.heading("Engineering"));
    await test.expect(q.dialog("Dan")).toBeHidden();
  });

  test("hover both anchors of one element when a scroll moves it under the mouse", async ({
    page,
    q,
  }) => {
    const authors = query(q.region("Authors"));
    await q.region("Authors").scrollIntoViewIfNeeded();
    await authors.link("Ana").hover();
    await test.expect(q.dialog("Ana")).toBeVisible();
    await test.expect(q.tooltip("Design lead")).toBeVisible();
    // Both callbacks accept a page scroll.
    const distance =
      (await getCenterY(authors.link("Ben"))) -
      (await getCenterY(authors.link("Ana")));
    await page.evaluate((top) => window.scrollBy(0, top), distance);
    await test.expect(q.dialog("Ben")).toBeVisible();
    await test.expect(q.tooltip("Illustrator")).toBeVisible();
  });

  test("show the next tooltip at once while another tooltip is open", async ({
    page,
    q,
  }) => {
    const files = query(q.region("Recent files"));
    await q.region("Recent files").scrollIntoViewIfNeeded();
    await files.button("File 2").hover();
    await test.expect(q.tooltip("Open File 2")).toBeVisible();
    await wheelTo(page, files.button("File 2"), files.button("File 3"));
    const tooltip = q.tooltip("Open File 3");
    await test.expect(tooltip).toBeVisible();
    // Only a tooltip that shows at once because of the skip window has this
    // attribute.
    await test.expect(tooltip).toHaveAttribute("data-instant");
    await test.expect(q.tooltip("Open File 2")).toBeHidden();
  });

  test("keep the hovercard on its anchor without hoverOnScroll", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("Without hoverOnScroll"));
    await q.navigation("Without hoverOnScroll").scrollIntoViewIfNeeded();
    await nav.link("Button").hover();
    await test.expect(q.dialog("Button")).toBeVisible();
    await wheelTo(page, nav.link("Button"), nav.link("Checkbox"));
    await test.expect(nav.link("Button")).toBeInViewport();
    // The scroll event fires after the wheel resolves, in the next frame.
    await flushFrames(page);
    // A scroll that counted as hover would move the hovercard at once, and hide
    // it after the hide timeout, which nothing shows while it's pending.
    await page.waitForTimeout(hideTimeout);
    await test.expect(q.dialog("Button")).toHaveAttribute("data-open");
  });

  // A scroll can't see inside shadow roots, so it doesn't count as hover for
  // the anchors there.
  test("keep the hovercard open when the page scrolls under an anchor in a shadow root", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("Shadow root"));
    await q.navigation("Shadow root").scrollIntoViewIfNeeded();
    await nav.link("Button").hover();
    await test.expect(q.dialog("Button")).toBeVisible();
    // A small page scroll keeps the anchor under the mouse.
    await page.evaluate(() => window.scrollBy(0, 4));
    // The script scroll fires its scroll event in the next frame.
    await flushFrames(page);
    // A scroll that counted as hover would hide the hovercard after the hide
    // timeout, which nothing shows while it's pending.
    await page.waitForTimeout(hideTimeout);
    await test.expect(q.dialog("Button")).toHaveAttribute("data-open");
  });

  test("keep a hovercard in a shadow root open when the page scrolls under it", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("Overlay"));
    const card = q.dialog("Button");
    await q.navigation("Overlay").scrollIntoViewIfNeeded();
    await nav.link("Button").hover();
    await test.expect(card).toBeVisible();
    await card.hover();
    // A small page scroll moves the hovercard with its anchor, so the mouse
    // stays on the hovercard.
    await page.evaluate(() => window.scrollBy(0, 4));
    // The script scroll fires its scroll event in the next frame.
    await flushFrames(page);
    // A scroll that counted as hover would hide the hovercard after the hide
    // timeout, which nothing shows while it's pending.
    await page.waitForTimeout(hideTimeout);
    await test.expect(card).toHaveAttribute("data-open");
  });

  test("ignore scrolls after a key press until the mouse moves", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("Components"));
    await q.navigation("Components").scrollIntoViewIfNeeded();
    await nav.link("Button").hover();
    await test.expect(q.dialog("Button")).toBeVisible();
    await page.keyboard.press("a");
    await wheelTo(page, nav.link("Button"), nav.link("Checkbox"));
    await test.expect(nav.link("Button")).toBeInViewport();
    // The scroll event fires after the wheel resolves, in the next frame.
    await flushFrames(page);
    // A scroll that counted as hover would hide the hovercard after the hide
    // timeout, which nothing shows while it's pending.
    await page.waitForTimeout(hideTimeout);
    await test.expect(q.dialog("Button")).toHaveAttribute("data-open");
    // A mouse move counts as hover again.
    await nav.link("Checkbox").hover({ position: { x: 4, y: 4 } });
    await test.expect(q.dialog("Checkbox")).toBeVisible();
  });

  // Shift with the mouse wheel scrolls sideways, and modifier keys don't scroll
  // on their own.
  test("keep counting scrolls after a modifier key press", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("Components"));
    await q.navigation("Components").scrollIntoViewIfNeeded();
    await nav.link("Button").hover();
    await test.expect(q.dialog("Button")).toBeVisible();
    await page.keyboard.press("Shift");
    await wheelTo(page, nav.link("Button"), nav.link("Checkbox"));
    await test.expect(q.dialog("Checkbox")).toBeVisible();
  });

  test("count only the scrolls that the hoverOnScroll callback accepts", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("List scrolls"));
    await q.navigation("List scrolls").scrollIntoViewIfNeeded();
    await nav.link("Button").hover();
    await test.expect(q.dialog("Button")).toBeVisible();
    // The callback rejects a page scroll, for both the move and the hide.
    const distance =
      (await getCenterY(nav.link("Checkbox"))) -
      (await getCenterY(nav.link("Button")));
    await page.evaluate((top) => window.scrollBy(0, top), distance);
    // The script scroll fires its scroll event in the next frame.
    await flushFrames(page);
    // A rejected hide would run only after the hide timeout, which nothing
    // shows while it's pending.
    await page.waitForTimeout(hideTimeout);
    await test.expect(q.dialog("Button")).toHaveAttribute("data-open");
    // It accepts a scroll of the list.
    await wheelTo(page, nav.link("Checkbox"), nav.link("Select"));
    await test.expect(q.dialog("Select")).toBeVisible();
  });
});
