import type { Locator, Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

const portalId = "portal/tooltip-repro";

async function getPortalState(page: Page) {
  return page.evaluate((id) => {
    const nodes = Array.from(document.querySelectorAll(`#${CSS.escape(id)}`));
    const node = nodes[0];
    const fullscreenElement = document.fullscreenElement;

    return {
      count: nodes.length,
      parentIsBody: node?.parentElement === document.body,
      parentIsFullscreen:
        !!fullscreenElement && node?.parentElement === fullscreenElement,
    };
  }, portalId);
}

function isPortalParentBody(tooltip: Locator) {
  return tooltip.evaluate((element) => {
    const portalNode = element.closest("[id^='portal/']");
    if (!portalNode) return false;
    return portalNode.parentElement === document.body;
  });
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  // See https://github.com/ariakit/ariakit/issues/6585 To reproduce the React
  // 18 StrictMode failure in a browser, serve the app with
  // `pnpm react18 -- pnpm dev-app`. CI's React 18 signal comes from test.ts.
  test("does not leak duplicate tooltip portal containers", async ({
    page,
    q,
  }) => {
    await test
      .expect(q.status("Portal containers"))
      .toHaveText("Portal containers: 0");

    await q.button("Hover target").hover();
    await test.expect(q.tooltip("Tooltip content")).toBeVisible();
    await test
      .expect(q.status("Portal containers"))
      .toHaveText("Portal containers: 1");

    await q.button("Unmount tooltip").click();
    await test.expect(q.tooltip("Tooltip content")).not.toBeVisible();
    await test
      .expect(q.status("Portal containers"))
      .toHaveText("Portal containers: 0");

    const state = await getPortalState(page);
    test.expect(state.count).toBe(0);
  });

  test("keeps one portal container while moving in and out of fullscreen", async ({
    page,
    q,
  }) => {
    await test
      .expect(q.status("Portal containers"))
      .toHaveText("Portal containers: 0");
    await q.button("Unmount tooltip").click();
    await test
      .expect(q.status("Portal containers"))
      .toHaveText("Portal containers: 0");

    await q.button("Pin tooltip").click();
    await q.button("Enter fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);
    await q.button("Mount tooltip").click();
    await test.expect(q.tooltip("Tooltip content")).toBeVisible();

    await test.expect
      .poll(() => getPortalState(page))
      .toMatchObject({
        count: 1,
        parentIsFullscreen: true,
      });

    await q.button("Exit fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);

    await test.expect
      .poll(() => getPortalState(page))
      .toMatchObject({
        count: 1,
        parentIsBody: true,
      });

    await q.button("Enter fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);

    await test.expect
      .poll(() => getPortalState(page))
      .toMatchObject({
        count: 1,
        parentIsFullscreen: true,
      });

    await q.button("Unmount tooltip").click();
    await test
      .expect(q.status("Portal containers"))
      .toHaveText("Portal containers: 0");

    const state = await getPortalState(page);
    test.expect(state.count).toBe(0);
  });

  test("moves the portal to body when the fullscreen host is removed", async ({
    page,
    q,
  }) => {
    await test
      .expect(q.status("Portal containers"))
      .toHaveText("Portal containers: 0");

    await q.button("Pin tooltip").click();
    await q.button("Enter fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);

    await test.expect(q.tooltip("Tooltip content")).toBeVisible();
    await test.expect
      .poll(() => getPortalState(page))
      .toMatchObject({
        count: 1,
        parentIsFullscreen: true,
      });

    await q.button("Unmount fullscreen host").click();
    await page.waitForFunction(() => document.fullscreenElement == null);

    await test.expect(q.tooltip("Tooltip content")).toBeVisible();
    await test.expect
      .poll(() => getPortalState(page))
      .toMatchObject({
        count: 1,
        parentIsBody: true,
      });
  });

  // See https://github.com/ariakit/ariakit/issues/865
  test("tooltip renders inside fullscreen element", async ({ page, q }) => {
    await q.button("Enter fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);
    await q.button("Hover me").hover();
    const tooltip = q.tooltip("Fullscreen tooltip");
    await test.expect(tooltip).toBeVisible();

    const isInsideFullscreen = await tooltip.evaluate((element) => {
      const fullscreenElement = document.fullscreenElement;
      if (!fullscreenElement) return false;
      return fullscreenElement.contains(element);
    });
    test.expect(isInsideFullscreen).toBe(true);
  });

  // See https://github.com/ariakit/ariakit/issues/865
  test("tooltip moves back to body after exiting fullscreen", async ({
    page,
    q,
  }) => {
    await q.button("Enter fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);
    await q.button("Hover me").hover();
    await test.expect(q.tooltip("Fullscreen tooltip")).toBeVisible();

    await q.button("Exit fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);
    await q.button("Hover me").hover();
    const tooltip = q.tooltip("Fullscreen tooltip");
    await test.expect(tooltip).toBeVisible();

    test.expect(await isPortalParentBody(tooltip)).toBe(true);
  });

  // See https://github.com/ariakit/ariakit/issues/865
  test("tooltip mounted while in fullscreen renders inside it", async ({
    page,
    q,
  }) => {
    await q.button("Enter fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);
    await q.button("Show second tooltip").click();
    await q.button("Second anchor").hover();
    const tooltip = q.tooltip("Second tooltip");
    await test.expect(tooltip).toBeVisible();

    const isInsideFullscreen = await tooltip.evaluate((element) => {
      const fullscreenElement = document.fullscreenElement;
      if (!fullscreenElement) return false;
      return fullscreenElement.contains(element);
    });
    test.expect(isInsideFullscreen).toBe(true);
  });

  // https://github.com/ariakit/ariakit/issues/7750
  test("keeps a portal element of the app and its nested portal in place across fullscreen changes", async ({
    page,
    q,
  }) => {
    const slot = query(q.region("Portal leak repro")).group("Slot");
    await test.expect(query(slot).text("Slot content")).toBeVisible();
    await test.expect(query(slot).text("Nested content")).toBeVisible();

    await q.button("Pin tooltip").click();
    await q.button("Enter fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);
    // The default portal node of the pinned tooltip moves on the same
    // fullscreenchange event that must not move the slot, so its new place
    // shows that the page handled the event.
    await test.expect
      .poll(() => getPortalState(page))
      .toMatchObject({
        count: 1,
        parentIsFullscreen: true,
      });
    // The fullscreen element is outside the slot, so the portal node nested in
    // the slot must not follow it.
    await test.expect(query(slot).text("Slot content")).toBeVisible();
    await test.expect(query(slot).text("Nested content")).toBeVisible();

    await q.button("Exit fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);
    await test.expect
      .poll(() => getPortalState(page))
      .toMatchObject({
        count: 1,
        parentIsBody: true,
      });

    await test.expect(query(slot).text("Slot content")).toBeVisible();
    await test.expect(query(slot).text("Nested content")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7758
  test("does not throw when an element inside a dialog enters fullscreen", async ({
    page,
    q,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await q.button("Open video").click();
    const dialog = q.dialog("Video");
    await test.expect(dialog).toBeVisible();

    await q.button("Player fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);
    await test.expect(dialog).toBeVisible();

    // The click needs the player to be reachable while it is in fullscreen.
    await q.button("Exit player fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);
    // The browser dispatches the fullscreenchange event of the entry before the
    // exit button can be clicked, so the page already reported an error from
    // that event.
    test.expect(errors).toEqual([]);

    await q.button("Close video").click();
    await test.expect(dialog).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7763
  test("keeps the portal in body while the page is in fullscreen", async ({
    page,
    q,
  }) => {
    await q.button("Pin tooltip").click();
    const tooltip = q.tooltip("Tooltip content");
    await test.expect(tooltip).toBeVisible();
    await test.expect
      .poll(() => getPortalState(page))
      .toMatchObject({
        count: 1,
        parentIsBody: true,
      });

    await q.button("Enter page fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);
    // The portal node must keep its place, so no state shows that the page
    // handled the fullscreenchange event. The browser dispatches that event on
    // the rendering update after it sets the fullscreen element, so the frames
    // cross it.
    await flushFrames(page);
    test.expect(await getPortalState(page)).toMatchObject({
      count: 1,
      parentIsBody: true,
    });
    await test.expect(tooltip).toBeVisible();

    await q.button("Exit fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);
    // The same applies to the fullscreenchange event of the exit.
    await flushFrames(page);
    test.expect(await getPortalState(page)).toMatchObject({
      count: 1,
      parentIsBody: true,
    });
    await test.expect(tooltip).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7763
  test("keeps a portal that mounts in page fullscreen in body", async ({
    page,
    q,
  }) => {
    await q.button("Enter page fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);
    await q.button("Show second tooltip").click();
    await q.button("Second anchor").hover();
    const tooltip = q.tooltip("Second tooltip");
    await test.expect(tooltip).toBeVisible();
    test.expect(await isPortalParentBody(tooltip)).toBe(true);

    await q.button("Exit fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);
    await q.button("Second anchor").hover();
    await test.expect(tooltip).toBeVisible();
    test.expect(await isPortalParentBody(tooltip)).toBe(true);
  });

  // https://github.com/ariakit/ariakit/issues/7761
  test("keeps a popup of a fullscreen player inside a dialog reachable", async ({
    page,
    q,
  }) => {
    await q.button("Open movie").click();
    const player = q.group("Movie player");
    const playback = q.status("Playback");

    await q.button("Movie fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);

    await q.button("Quality").click();
    // The browser shows only the fullscreen player and its descendants.
    await test.expect(query(player).dialog("Quality")).toBeVisible();
    // The click needs the popup to be reachable while the player is in
    // fullscreen.
    await q.button("High").click();
    await test.expect(playback).toContainText("Quality: High");

    await q.button("Exit movie fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);

    await q.button("Quality").click();
    await q.button("Low").click();
    await test.expect(playback).toContainText("Quality: Low");
  });

  // https://github.com/ariakit/ariakit/issues/7761
  test("keeps a popup that mounts in a fullscreen player inside a dialog reachable", async ({
    page,
    q,
  }) => {
    await q.button("Open movie").click();
    const player = q.group("Movie player");
    const playback = q.status("Playback");

    await q.button("Movie fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);

    await q.button("Captions").click();
    // The browser shows only the fullscreen player and its descendants.
    await test.expect(query(player).dialog("Captions")).toBeVisible();
    // The click needs the popup to be reachable while the player is in
    // fullscreen.
    await q.button("English").click();
    await test.expect(playback).toContainText("Captions: English");

    await q.button("Exit movie fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);

    await q.button("Captions").click();
    await q.button("Spanish").click();
    await test.expect(playback).toContainText("Captions: Spanish");
  });

  // https://github.com/ariakit/ariakit/issues/7761
  test("moves the portal of a popup back to the dialog when the player exits fullscreen", async ({
    page,
    q,
  }) => {
    await q.button("Open movie").click();
    const player = q.group("Movie player");

    await q.button("Movie fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);
    await q.button("Quality").click();
    await test.expect(query(player).dialog("Quality")).toBeVisible();

    // The click outside the popup hides it.
    await q.button("Exit movie fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);

    await q.button("Quality").click();
    await test.expect(q.dialog("Quality")).toBeVisible();
    await test.expect(query(player).dialog("Quality")).toHaveCount(0);
  });

  // https://github.com/ariakit/ariakit/issues/7761
  test("keeps the portal of a nested dialog in place when an element inside it enters fullscreen", async ({
    page,
    q,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await q.button("Open library").click();
    await query(q.dialog("Library")).button("Open movie").click();
    const player = q.group("Movie player");
    const playback = q.status("Playback");

    await q.button("Movie fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);

    // The popup follows the player, and the portal of the movie dialog, which
    // contains the player, doesn't.
    await q.button("Quality").click();
    await test.expect(query(player).dialog("Quality")).toBeVisible();
    await q.button("High").click();
    await test.expect(playback).toContainText("Quality: High");

    await q.button("Exit movie fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);
    // The browser dispatches the fullscreenchange event of the entry before the
    // exit button can be clicked, so the page already reported an error from
    // that event.
    test.expect(errors).toEqual([]);

    await q.button("Close movie").click();
    await test.expect(q.dialog("Movie")).not.toBeVisible();
    await test.expect(q.dialog("Library")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7773
  test("keeps a popup of a fullscreen player inside a shadow tree reachable", async ({
    page,
    q,
  }) => {
    const playback = q.status("Shadow playback");

    await q.button("Shadow player fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);

    await q.button("Speed").click();
    // The browser shows only the fullscreen player and its descendants.
    await test.expect(q.dialog("Speed")).toBeVisible();
    // The click needs the popup to be reachable while the player is in
    // fullscreen.
    await q.button("Fast").click();
    await test.expect(playback).toContainText("Speed: Fast");

    await q.button("Exit shadow player fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);

    await q.button("Speed").click();
    await q.button("Slow").click();
    await test.expect(playback).toContainText("Speed: Slow");
  });

  // https://github.com/ariakit/ariakit/issues/7773
  test("keeps a popup that mounts in a fullscreen player inside a shadow tree reachable", async ({
    page,
    q,
  }) => {
    const playback = q.status("Shadow playback");

    await q.button("Shadow player fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);

    await q.button("Audio").click();
    // The browser shows only the fullscreen player and its descendants.
    await test.expect(q.dialog("Audio")).toBeVisible();
    // The click needs the popup to be reachable while the player is in
    // fullscreen.
    await q.button("Mono").click();
    await test.expect(playback).toContainText("Audio: Mono");

    await q.button("Exit shadow player fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);

    await q.button("Audio").click();
    await q.button("Surround").click();
    await test.expect(playback).toContainText("Audio: Surround");
  });

  // https://github.com/ariakit/ariakit/issues/7773
  test("keeps a popup of a fullscreen player inside a shadow tree in a dialog reachable", async ({
    page,
    q,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await q.button("Open theater").click();
    const theater = query(q.dialog("Theater"));
    const playback = theater.status("Shadow playback");

    await theater.button("Shadow player fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);

    // The popup follows the player, and the portal of the dialog, which
    // contains the shadow tree of the player, doesn't.
    await theater.button("Speed").click();
    await test.expect(q.dialog("Speed")).toBeVisible();
    await q.button("Fast").click();
    await test.expect(playback).toContainText("Speed: Fast");

    await theater.button("Exit shadow player fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);
    // The browser dispatches the fullscreenchange event of the entry before the
    // exit button can be clicked, so the page already reported an error from
    // that event.
    test.expect(errors).toEqual([]);

    await theater.button("Speed").click();
    await q.button("Slow").click();
    await test.expect(playback).toContainText("Speed: Slow");

    await q.button("Close theater").click();
    await test.expect(q.dialog("Theater")).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7773
  test("keeps the document styles of a popup of a fullscreen player whose shadow host has a slot", async ({
    page,
    q,
  }) => {
    const playback = q.status("Slotted playback");
    const popup = q.dialog("Volume");

    await q.button("Slotted player fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);

    await q.button("Volume").click();
    // The shadow host displays the popup in its slot, which is inside the
    // fullscreen player.
    await test.expect(popup).toBeVisible();
    // The rule for the popup is in a stylesheet of the document, which doesn't
    // apply to an element inside the shadow tree.
    await test.expect(popup).toHaveCSS("outline-style", "dashed");
    await q.button("Loud").click();
    await test.expect(playback).toContainText("Volume: Loud");

    await q.button("Exit slotted player fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);

    await q.button("Volume").click();
    await test.expect(popup).toHaveCSS("outline-style", "dashed");
    await q.button("Quiet").click();
    await test.expect(playback).toContainText("Volume: Quiet");
  });

  // https://github.com/ariakit/ariakit/issues/7773
  test("keeps the scroll position of a popup when a frame enters and exits fullscreen", async ({
    page,
    q,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Frame player']"));

    await q.button("Playlist").click();
    const lastTrack = query(q.dialog("Playlist")).text("Track 12");
    await lastTrack.scrollIntoViewIfNeeded();
    await test.expect(lastTrack).toBeInViewport();

    await frame.button("Frame fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);
    await frame.button("Exit frame fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);
    // The playlist must keep its scroll position, so no state shows that the
    // page handled the fullscreenchange events. The browser dispatches each
    // event on the rendering update after it changes the fullscreen element, so
    // the frames cross the event of the exit.
    await flushFrames(page);
    await test.expect(lastTrack).toBeInViewport();
  });

  // https://github.com/ariakit/ariakit/issues/7773
  test("keeps the scroll position of a popup in a dialog when a frame of the dialog enters and exits fullscreen", async ({
    page,
    q,
  }) => {
    const frame = query(
      page.frameLocator("iframe[title='Theater frame player']"),
    );

    await q.button("Open theater").click();
    await query(q.dialog("Theater")).button("Playlist").click();
    const lastTrack = query(q.dialog("Playlist")).text("Track 12");
    await lastTrack.scrollIntoViewIfNeeded();
    await test.expect(lastTrack).toBeInViewport();

    await frame.button("Frame fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);
    await frame.button("Exit frame fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);
    // The playlist must keep its scroll position, so no state shows that the
    // page handled the fullscreenchange event of the exit. The browser
    // dispatches that event on the rendering update after it clears the
    // fullscreen element, so the frames cross it. Here, the portal node of the
    // playlist is a child of the portal node of the dialog, and the frame is
    // inside a shadow tree.
    await flushFrames(page);
    await test.expect(lastTrack).toBeInViewport();
  });
});
