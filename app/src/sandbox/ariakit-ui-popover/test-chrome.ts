import { countAnimations } from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // The popovers held open in this sandbox mark every popover that already
  // exists when they open as outside them, and Ariakit then ignores Escape on
  // it. The live popover renders in a portal and mounts on open to avoid the
  // marks, and this test guards that it still closes on Escape.
  // https://github.com/ariakit/ariakit/issues/7463
  test("closes the live popover on Escape while others are held open", async ({
    page,
    q,
  }) => {
    const disclosure = q.button("Event details");
    await disclosure.click();
    const popover = q.dialog("Design review");
    await test.expect(popover).toBeVisible();
    // The popover renders in a portal, outside its box.
    await test
      .expect(query(q.article("Opened on click")).dialog())
      .toHaveCount(0);
    await test.expect(query(popover).button("Close")).toBeFocused();
    await page.keyboard.press("Escape");
    await test.expect(popover).toBeHidden();
    await test.expect(disclosure).toBeFocused();
    // The held popovers ignore Escape and stay open.
    await test
      .expect(query(q.article("Default")).dialog("Team meeting"))
      .toBeVisible();
  });

  test("closes the live popover on a click outside", async ({ q }) => {
    await q.button("Event details").click();
    const popover = q.dialog("Design review");
    await test.expect(popover).toBeVisible();
    await q.heading("Opened on click").click();
    await test.expect(popover).toBeHidden();
  });

  test("closes a held popover from its dismiss and reopens it from its disclosure", async ({
    q,
  }) => {
    const box = query(q.article("Brand callout"));
    const popover = box.dialog("New: saved views");
    await test.expect(popover).toBeVisible();
    await box.button("Got it").click();
    await test.expect(popover).toBeHidden();
    await box.button("Views").click();
    await test.expect(popover).toBeVisible();
  });

  test("closes a popover from a dismiss without children", async ({ q }) => {
    const box = query(q.article("Close button"));
    const popover = box.dialog("Notifications");
    await test.expect(popover).toBeVisible();
    await box.button("Dismiss popup").click();
    await test.expect(popover).toBeHidden();
    await box.button("Notifications").click();
    await test.expect(popover).toBeVisible();
  });

  test("describes a popover that has no heading", async ({ q }) => {
    const popover = query(q.article("Compact frame")).dialog("Share");
    await test
      .expect(popover)
      .toHaveAccessibleDescription("Anyone with the link can view.");
  });

  // The entry transition runs for a few hundred milliseconds from the frame
  // that shows the popover, so a regression is still running when the
  // visibility assertion passes.
  test("runs no popover animation when the user prefers reduced motion", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await q.button("Event details").click();
    const popover = q.dialog("Design review");
    await test.expect(popover).toBeVisible();
    test.expect(await countAnimations(popover)).toBe(0);
  });

  // Every ariakit-ui-* sandbox builds its boxes from the same example
  // component, so one sandbox guards the More info popover for all of them. The
  // popovers held open here mark the grid as outside them, and Ariakit reads
  // that mark from an element's ancestors, so the popover closes on Escape only
  // while it renders in a portal.
  // https://github.com/ariakit/ariakit/issues/7463
  test("closes the More info popover of a box on Escape", async ({
    page,
    q,
  }) => {
    const moreInfo = query(q.article("Default")).button("More info");
    await moreInfo.click();
    const popover = q.dialog("Default");
    await test.expect(popover).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(popover).toBeHidden();
    await test.expect(moreInfo).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/7465#discussion_r3992662589
  test("names an icon-only dismiss whose label prop is undefined", async ({
    q,
  }) => {
    const popover = query(q.article("Dismiss with an optional label")).dialog(
      "Messages",
    );
    await test.expect(query(popover).button("Dismiss popup")).toBeVisible();
  });
});
