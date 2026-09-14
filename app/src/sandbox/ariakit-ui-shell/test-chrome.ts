import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getSidebar, selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test.describe("wide", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("links the toggle to the sidebar column, which nothing makes modal", async ({
      q,
    }) => {
      const toggle = q.button("Toggle sidebar");
      const sidebar = getSidebar(q, "Documentation");
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await expect(toggle).toHaveAttribute(
        "aria-controls",
        (await sidebar.getAttribute("id")) ?? "",
      );
      // Nothing outside is inert, and Escape does nothing.
      await expect(q.main()).not.toHaveAttribute("inert");
      await query(sidebar).link("Installation").focus();
      await toggle.press("Escape");
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
    });

    test("switches the fold and the compensation off together under reduced motion, whatever the inline duration", async ({
      page,
      q,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await selectScenario(q, "settings");
      const sidebar = getSidebar(q, "Settings sections");
      const main = q.main();
      await expect(sidebar).toHaveCSS("width", "224px");
      await q.button("Toggle sidebar").click();
      // The shell asks for 600ms; the multiplier zeroes it.
      expect(
        await sidebar.evaluate((node) => node.getAnimations().length),
      ).toBe(0);
      expect(await main.evaluate((node) => node.getAnimations().length)).toBe(
        0,
      );
      await expect(sidebar).toHaveCSS("width", "0px");
    });

    test("runs the fold on the inline duration otherwise", async ({
      page,
      q,
    }) => {
      await selectScenario(q, "settings");
      const sidebar = getSidebar(q, "Settings sections");
      await q.button("Toggle sidebar").click();
      const durations = await sidebar.evaluate((node) =>
        node.getAnimations().map((animation) => {
          const timing = animation.effect?.getComputedTiming();
          return timing?.duration;
        }),
      );
      expect(durations).toContain(600);
      // A short wait is not enough for the 600ms fold to finish.
      await page.waitForTimeout(100);
      const width = await sidebar.evaluate(
        (node) => node.getBoundingClientRect().width,
      );
      expect(width).toBeGreaterThan(0);
      await expect(sidebar).toHaveCSS("width", "0px");
    });

    test("keeps the content visible through the closing fold and shows it at once on opening", async ({
      q,
    }) => {
      await selectScenario(q, "settings");
      const sidebar = getSidebar(q, "Settings sections");
      const visibility = () =>
        sidebar.evaluate((node) => getComputedStyle(node).visibility);
      await q.button("Toggle sidebar").click();
      // Closing: the flip waits out the 600ms fold, so the content is still
      // visible while the column narrows.
      expect(await visibility()).toBe("visible");
      await expect(sidebar).toHaveCSS("visibility", "hidden");
      // Opening: the flip lands at once, before the fold, or the column would
      // grow empty for 600ms. The toggle is labelled while the sidebar is
      // closed.
      await q.button("Sections").click();
      expect(await visibility()).toBe("visible");
    });

    test("keeps the icon and the default name on a toggle whose children are false", async ({
      q,
    }) => {
      await selectScenario(q, "settings");
      // Open by default: the conditional label is false.
      const toggle = q.button("Toggle sidebar");
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await expect(toggle.locator("svg")).toHaveCount(1);
      await toggle.click();
      // Closed: the label is the content and the name.
      await expect(q.button("Sections")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await expect(q.button("Toggle sidebar")).toHaveCount(0);
    });
  });
});
