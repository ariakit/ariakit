import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "popover" },
  async ({ test, query }) => {
    // The popovers held open on this route mark every popover that already
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
      await q.heading("Popover", { level: 1 }).click();
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

    test("drops the popover motion when the user prefers reduced motion", async ({
      page,
      q,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await q.button("Event details").click();
      const popover = q.dialog("Design review");
      await test.expect(popover).toBeVisible();
      await test.expect(popover).toHaveCSS("transition-property", "none");
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await test.expect(popover).not.toHaveCSS("transition-property", "none");
    });
  },
);
