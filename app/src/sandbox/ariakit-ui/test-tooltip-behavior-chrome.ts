import {
  waitForPreviewHydration,
  withFramework,
} from "#app/test-utils/preview.ts";
import { GALLERY_STORAGE_PREFIX } from "./pages.ts";

withFramework(
  import.meta.dirname,
  { route: "tooltip" },
  async ({ test, query }) => {
    // The tooltips held open on this route mark every tooltip that already
    // exists when they open as outside them, and Ariakit then ignores Escape on
    // it. The live tooltip mounts on open to avoid the marks, and this test
    // guards that it still closes on Escape.
    // https://github.com/ariakit/ariakit/issues/7463
    test("closes the live tooltip on Escape while others are held open", async ({
      page,
      q,
    }) => {
      const anchor = q.button("Publish");
      await anchor.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await test.expect(anchor).toBeFocused();
      const tooltip = q.tooltip("Publish to the public site");
      await test.expect(tooltip).toBeVisible();
      // The tooltip renders in a portal, outside its box.
      await test
        .expect(query(q.article("Hover or focus")).tooltip())
        .toHaveCount(0);
      await page.keyboard.press("Escape");
      await test.expect(tooltip).toBeHidden();
      await test.expect(anchor).toBeFocused();
      // The held tooltips ignore Escape and stay open.
      await test.expect(q.tooltip("Save changes")).toBeVisible();
    });

    test("opens the live tooltip on hover", async ({ q }) => {
      const anchor = q.button("Publish");
      // Ariakit resets hover intent on scroll, so the anchor must be in view
      // before the pointer moves over it.
      await anchor.scrollIntoViewIfNeeded();
      await anchor.hover();
      const tooltip = q.tooltip("Publish to the public site");
      await test.expect(tooltip).toBeVisible();
      await q.heading("Tooltip", { level: 1 }).hover();
      await test.expect(tooltip).toBeHidden();
    });

    test("paints a live tooltip like a held one on a tinted surface", async ({
      page,
      q,
    }) => {
      await page.evaluate(({ key }) => localStorage.setItem(key, "tinted"), {
        key: `${GALLERY_STORAGE_PREFIX}surface`,
      });
      await page.reload({ waitUntil: "load" });
      await waitForPreviewHydration(page);
      const held = q.tooltip("Save changes");
      await test.expect(held).toBeVisible();
      const heldColor = await held.evaluate(
        (node) => getComputedStyle(node).backgroundColor,
      );

      const anchor = q.button("Publish");
      await anchor.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const live = q.tooltip("Publish to the public site");
      await test.expect(live).toBeVisible();
      // The live tooltip portals into the gallery surface, so it lifts from the
      // same layer as the held one instead of from the canvas.
      await test.expect(live).toHaveCSS("background-color", heldColor);
    });
  },
);
