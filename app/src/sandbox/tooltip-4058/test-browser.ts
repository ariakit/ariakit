import type { Locator } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// These tests scroll by script. A scroll by script counts like any other, and
// it sends no mouse events that could hide a popup for another reason.
function scrollBy(element: Locator, left: number, top: number) {
  return element.evaluate(
    (element, { left, top }) => element.scrollBy({ left, top }),
    { left, top },
  );
}

async function getTop(locator: Locator) {
  const box = await locator.boundingBox();
  return box?.y ?? null;
}

withFramework(import.meta.dirname, async ({ test }) => {
  // Each popup follows its anchor on scroll, and the anchor check runs in that
  // same position update. So a popup that moved has run the check.
  async function expectToFollowAnchor(popup: Locator, top: number | null) {
    await test.expect.poll(() => getTop(popup)).not.toBe(top);
  }

  // https://github.com/ariakit/ariakit/issues/4058
  test("hide a tooltip opened by focus when an outer container hides its anchor", async ({
    page,
    q,
  }) => {
    await q.region("Formatting").focus();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Bold")).toBeFocused();
    await test.expect(q.tooltip("Bold text")).toBeVisible();
    // The outer panel hides the whole row, while the row itself doesn't scroll.
    await scrollBy(q.region("Formatting"), 0, 200);
    await test.expect(q.button("Bold")).not.toBeInViewport();
    await test.expect(q.tooltip("Bold text")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/4058
  test("hide a tooltip when a sideways scroll hides its anchor", async ({
    page,
    q,
  }) => {
    await q.region("Formatting").focus();
    await page.keyboard.press("Tab");
    await test.expect(q.tooltip("Bold text")).toBeVisible();
    await scrollBy(q.group("Text styles"), 1000, 0);
    await test.expect(q.button("Bold")).not.toBeInViewport();
    await test.expect(q.tooltip("Bold text")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/4058
  test("keep a tooltip open while its anchor is partly visible", async ({
    page,
    q,
  }) => {
    const panel = q.region("Formatting");
    const anchor = q.button("Bold");
    const tooltip = q.tooltip("Bold text");
    await panel.focus();
    await page.keyboard.press("Tab");
    await test.expect(tooltip).toBeVisible();
    const anchorBox = await anchor.boundingBox();
    const panelTop = await panel.evaluate(
      (element) => element.getBoundingClientRect().top + element.clientTop,
    );
    test.expect(anchorBox).not.toBeNull();
    if (!anchorBox) return;
    const tooltipTop = await getTop(tooltip);
    // Hide the top half of the anchor.
    await scrollBy(panel, 0, anchorBox.y - panelTop + anchorBox.height / 2);
    await test.expect(anchor).toBeInViewport();
    await test.expect(anchor).not.toBeInViewport({ ratio: 0.9 });
    await expectToFollowAnchor(tooltip, tooltipTop);
    // The tooltip would close in the render after that position update.
    await flushFrames(page);
    await test.expect(tooltip).toHaveAttribute("data-open");
  });

  // https://github.com/ariakit/ariakit/issues/4058
  test("keep a tooltip open when a page scroll moves its anchor out of the window", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.button("Share")).toBeFocused();
    const tooltip = q.tooltip("Share this page");
    await test.expect(tooltip).toBeVisible();
    await page.evaluate(() => window.scrollBy(0, 2000));
    await test.expect(q.button("Share")).not.toBeInViewport();
    // The page scroll moves the tooltip with the anchor, so nothing shows that
    // the position update ran. It runs on the scroll event, before the next
    // frame, and the close would render in the frame after it.
    await flushFrames(page);
    await test.expect(tooltip).toHaveAttribute("data-open");
  });

  test("keep a tooltip open with hideWhenAnchorHidden set to false", async ({
    page,
    q,
  }) => {
    const panel = q.region("Archive");
    const tooltip = q.tooltip("Move to archive");
    await panel.focus();
    await page.keyboard.press("Tab");
    await test.expect(tooltip).toBeVisible();
    const tooltipTop = await getTop(tooltip);
    await scrollBy(panel, 0, 200);
    await test.expect(q.button("Archive")).not.toBeInViewport();
    await expectToFollowAnchor(tooltip, tooltipTop);
    // A close would render in the frame after that position update, and nothing
    // else shows that it didn't happen.
    await flushFrames(page);
    await test.expect(tooltip).toHaveAttribute("data-open");
  });

  test("keep a hovercard open while focus is inside it", async ({
    page,
    q,
  }) => {
    const anchor = q.link("@ariakit");
    const card = q.dialog("Ariakit");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves to it.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    await test.expect(card).toBeVisible();
    await q.button("Follow").click();
    await test.expect(q.button("Follow")).toBeFocused();
    const cardTop = await getTop(card);
    await scrollBy(q.region("Contributors"), 0, 200);
    await test.expect(anchor).not.toBeInViewport();
    await expectToFollowAnchor(card, cardTop);
    // A close would render in the frame after that position update, and nothing
    // else shows that it didn't happen.
    await flushFrames(page);
    await test.expect(card).toHaveAttribute("data-open");
  });

  test("keep a hovercard open while focus is in a web component in a nested popover in a shadow root", async ({
    page,
    q,
  }) => {
    const anchor = q.link("@ariakit");
    const card = q.dialog("Ariakit");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves to it.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    await test.expect(card).toBeVisible();
    // The popover renders in an overlay layer inside a shadow root, outside the
    // hovercard element. The pointer stays on the hovercard, so the keyboard
    // moves focus in the popover.
    await q.button("Share profile").click();
    await test.expect(q.dialog("Share profile")).toBeFocused();
    // The button is in the shadow root of a web component.
    await page.keyboard.press("Tab");
    await test.expect(q.button("Copy link")).toBeFocused();
    const cardTop = await getTop(card);
    await scrollBy(q.region("Contributors"), 0, 200);
    await test.expect(anchor).not.toBeInViewport();
    await expectToFollowAnchor(card, cardTop);
    // A close would render in the frame after that position update, and nothing
    // else shows that it didn't happen.
    await flushFrames(page);
    await test.expect(card).toHaveAttribute("data-open");
  });

  test("keep a hovercard open while focus is in a menu inside it", async ({
    page,
    q,
  }) => {
    const anchor = q.link("@ariakit");
    const card = q.dialog("Ariakit");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves to it.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    await test.expect(card).toBeVisible();
    // The menu renders in a portal, outside the hovercard element.
    await q.button("Profile actions").click();
    await test.expect(q.menu()).toBeFocused();
    const cardTop = await getTop(card);
    await scrollBy(q.region("Contributors"), 0, 200);
    await test.expect(anchor).not.toBeInViewport();
    await expectToFollowAnchor(card, cardTop);
    // A close would render in the frame after that position update, and nothing
    // else shows that it didn't happen.
    await flushFrames(page);
    await test.expect(card).toHaveAttribute("data-open");
  });

  test("keep a hovercard in a shadow root open while focus is inside it", async ({
    page,
    q,
  }) => {
    const anchor = q.link("@shadow");
    const card = q.dialog("Shadow profile");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves to it.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    await test.expect(card).toBeVisible();
    // The button is in the shadow root of a web component inside the card, so
    // focus is in a shadow root inside another one.
    await q.button("Copy link").click();
    await test.expect(q.button("Copy link")).toBeFocused();
    const cardTop = await getTop(card);
    await scrollBy(q.region("Shadow contributors"), 0, 200);
    await test.expect(anchor).not.toBeInViewport();
    await expectToFollowAnchor(card, cardTop);
    // A close would render in the frame after that position update, and nothing
    // else shows that it didn't happen.
    await flushFrames(page);
    await test.expect(card).toHaveAttribute("data-open");
  });

  test("keep a popover open by default when its anchor scrolls away", async ({
    page,
    q,
  }) => {
    const popover = q.text("Filter options");
    await q.button("Filter").click();
    await test.expect(popover).toBeVisible();
    await test.expect(q.button("Filter")).toBeFocused();
    const popoverTop = await getTop(popover);
    await scrollBy(q.region("Filters"), 0, 200);
    await test.expect(q.button("Filter")).not.toBeInViewport();
    await expectToFollowAnchor(popover, popoverTop);
    // A close would render in the frame after that position update, and nothing
    // else shows that it didn't happen.
    await flushFrames(page);
    await test.expect(popover).toHaveAttribute("data-open");
  });

  test("hide a popover with hideWhenAnchorHidden when its anchor scrolls away", async ({
    q,
  }) => {
    await q.button("Sort").click();
    await test.expect(q.text("Sort options")).toBeVisible();
    await scrollBy(q.region("Sorting"), 0, 200);
    await test.expect(q.button("Sort")).not.toBeInViewport();
    await test.expect(q.text("Sort options")).toBeHidden();
  });

  test("keep a menu open by default when its anchor scrolls away", async ({
    page,
    q,
  }) => {
    const menu = q.menu();
    await q.button("More actions").click();
    await test.expect(menu).toBeVisible();
    await test.expect(q.button("More actions")).toBeFocused();
    const menuTop = await getTop(menu);
    await scrollBy(q.region("Actions"), 0, 200);
    await test.expect(q.button("More actions")).not.toBeInViewport();
    await expectToFollowAnchor(menu, menuTop);
    // A close would render in the frame after that position update, and nothing
    // else shows that it didn't happen.
    await flushFrames(page);
    await test.expect(menu).toHaveAttribute("data-open");
  });

  test("hide a tooltip in a native modal dialog only when its anchor scrolls out", async ({
    page,
    q,
  }) => {
    await q.button("Open native dialog").click();
    const panel = q.region("Pinned");
    const anchor = q.button("Pin");
    const tooltip = q.tooltip("Pin to the top");
    await test.expect(panel).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(anchor).toBeFocused();
    await test.expect(tooltip).toBeVisible();
    // The dialog is in the top layer, where an anchor that is still in view
    // must not read as hidden.
    const tooltipTop = await getTop(tooltip);
    await scrollBy(panel, 0, 10);
    await expectToFollowAnchor(tooltip, tooltipTop);
    // A close would render in the frame after that position update, and nothing
    // else shows that it didn't happen.
    await flushFrames(page);
    await test.expect(tooltip).toHaveAttribute("data-open");
    await scrollBy(panel, 0, 200);
    await test.expect(anchor).not.toBeInViewport();
    await test.expect(tooltip).toBeHidden();
  });
});
