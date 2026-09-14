import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import {
  getBackdrop,
  getShell,
  getSidebar,
  getSidebarBody,
  selectScenario,
} from "./helpers.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test.describe("wide", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("keeps the sidebar body a plain region with a linked toggle", async ({
      q,
    }) => {
      const toggle = q.button("Toggle sidebar");
      const body = getSidebarBody(getSidebar(q, "Documentation"));
      await expect(q.dialog("Documentation")).toHaveCount(0);
      await expect(body).toHaveAttribute("role", "none");
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await expect(toggle).toHaveAttribute(
        "aria-controls",
        (await body.getAttribute("id")) ?? "",
      );
      // Nothing outside is inert, and Escape does nothing.
      await expect(q.main()).not.toHaveAttribute("inert");
      await query(q.navigation("Documentation")).link("Installation").focus();
      await toggle.press("Escape");
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
    });

    test("swaps the body into a modal dialog when the shell narrows, on the same element", async ({
      page,
      q,
    }) => {
      const body = getSidebarBody(getSidebar(q, "Documentation"));
      const handle = await body.elementHandle();
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(q.dialog("Documentation")).toBeVisible();
      await expect(q.main()).toHaveAttribute("inert");
      // The same node, never remounted.
      expect(await handle?.evaluate((node) => node.isConnected)).toBe(true);
      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(q.dialog("Documentation")).toHaveCount(0);
      await expect(q.main()).not.toHaveAttribute("inert");
      expect(await handle?.evaluate((node) => node.isConnected)).toBe(true);
    });

    test("keeps focus where it is when the shell narrows past the step with the sidebar open", async ({
      page,
      q,
    }) => {
      const toggle = q.button("Toggle table of contents");
      await toggle.focus();
      await expect(toggle).toBeFocused();
      await page.setViewportSize({ width: 390, height: 844 });
      const dialog = q.dialog("Documentation");
      await expect(dialog).toBeVisible();
      // The drawer is modal now, but it did not open: it must not take focus.
      // The focused control is inert behind it, which the browser blurs.
      await expect(query(dialog).link("Introduction")).not.toBeFocused();
      await expect(q.banner()).toHaveAttribute("inert");
    });

    test("flips the mode from a root font-size change without the window changing", async ({
      page,
      q,
    }) => {
      await expect(q.dialog("Documentation")).toHaveCount(0);
      // At 48px per rem, the 48rem step is 2304px: wider than the window.
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "48px";
      });
      await expect(q.dialog("Documentation")).toBeVisible();
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "";
      });
      await expect(q.dialog("Documentation")).toHaveCount(0);
    });

    test("switches the drawer and the compensation off together under reduced motion, whatever the inline duration", async ({
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

    test("runs the drawer on the inline duration otherwise", async ({
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

  test.describe("phone", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("opens the sidebar as a modal dialog that traps focus and returns it to the toggle", async ({
      page,
      q,
    }) => {
      const dialog = q.dialog("Documentation");
      const toggle = q.button("Toggle sidebar");
      // Open from the persisted state: modal, but focus stays where the page
      // left it, because nothing opened the drawer.
      await expect(dialog).toBeVisible();
      await expect(q.main()).toHaveAttribute("inert");
      await expect(q.banner()).toHaveAttribute("inert");
      await expect(query(dialog).link("Introduction")).not.toBeFocused();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(q.main()).not.toHaveAttribute("inert");
      await expect(toggle).toBeFocused();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      // Reopen from the toggle: focus moves in again.
      await toggle.click();
      await expect(dialog).toBeVisible();
      await expect(query(dialog).link("Introduction")).toBeFocused();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
    });

    test("closes the drawer from its backdrop and locks the page scroll while it is open", async ({
      page,
      q,
    }) => {
      const dialog = q.dialog("Documentation");
      const backdrop = getBackdrop(getSidebar(q, "Documentation"));
      await expect(dialog).toBeVisible();
      await expect(backdrop).toBeVisible();
      // The wheel reaches a locked page.
      await page.mouse.move(320, 500);
      await page.mouse.wheel(0, 400);
      // A locked page has not moved when the wheel event has been handled.
      await page.waitForTimeout(100);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      await backdrop.click({ position: { x: 350, y: 500 } });
      await expect(dialog).toBeHidden();
      await expect(backdrop).toBeHidden();
      // Like a native dialog, an outside click does not return focus to the
      // toggle.
      await expect(q.button("Toggle sidebar")).not.toBeFocused();
      await page.mouse.wheel(0, 400);
      await expect
        .poll(() => page.evaluate(() => window.scrollY))
        .toBeGreaterThan(0);
    });

    test("keeps a non-modal panel a plain region in overlay mode", async ({
      page,
      q,
    }) => {
      await selectScenario(q, "dashboard");
      // Close the navigation drawer first.
      await page.keyboard.press("Escape");
      await expect(q.dialog("Workspace")).toBeHidden();
      const details = getSidebar(q, "Details");
      await q.button("Toggle details").click();
      await expect(details).toHaveAttribute("data-open");
      await expect(getSidebarBody(details)).toBeVisible();
      await expect(q.dialog("Details")).toHaveCount(0);
      await expect(q.main()).not.toHaveAttribute("inert");
      await page.keyboard.press("Escape");
      await expect(details).toHaveAttribute("data-open");
    });

    test("makes the outer sidebar of a nested shell a modal drawer too", async ({
      page,
      q,
    }) => {
      await selectScenario(q, "dashboard");
      const dialog = q.dialog("Workspace");
      const toggle = q.button("Toggle sidebar");
      await expect(dialog).toBeVisible();
      // The inner shell, with the header and main, is outside the drawer.
      await expect(getShell(page).locator(".shell")).toHaveAttribute("inert");
      // Open from the start, so nothing moved focus into it.
      await expect(query(dialog).link("Acme")).not.toBeFocused();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(toggle).toBeFocused();
      await toggle.click();
      await expect(dialog).toBeVisible();
      await expect(query(dialog).link("Acme")).toBeFocused();
      expect(await getShell(page).count()).toBe(1);
    });
  });
});
