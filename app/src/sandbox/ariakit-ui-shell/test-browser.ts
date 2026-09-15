import { expect } from "@playwright/test";
import {
  forEachColorScheme,
  getViewportCapture,
} from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";
import {
  expectCentered,
  getBox,
  getContent,
  getShell,
  getSidebar,
  sampleCenterOffset,
  selectScenario,
} from "./test-helpers.ts";

// The header height token, 3.25rem at the 16px root font size.
const HEADER_HEIGHT = 52;
// The shell's motion duration.
const DURATION = 300;

withFramework(import.meta.dirname, async ({ test, query }) => {
  test.describe("wide", () => {
    // Wide enough for full centering with the docs sidebars: 256 + 192 + 768
    // + 48 + 64 = 1328.
    test.use({ viewport: { width: 1440, height: 900 } });

    test("moves the compensation in step with the drawer motion", async ({
      page,
      q,
    }) => {
      const shell = getShell(page);
      const content = getContent(q);
      await expectCentered(content, shell);
      await q.button("Toggle sidebar").click();
      // The drawer folds over the shell's duration, and the compensation must
      // follow it on every frame rather than jump at either end.
      const largest = await sampleCenterOffset(page, content, shell, DURATION);
      expect(largest).toBeLessThan(2);
      await expect(getSidebar(q, "Documentation")).toHaveCSS("width", "0px");
      await expectCentered(content, shell);
    });

    test("folds a closed sidebar to nothing and takes its links out of the tab order", async ({
      page,
      q,
    }) => {
      const sidebar = getSidebar(q, "Documentation");
      const toggle = q.button("Toggle sidebar");
      const link = query(sidebar).link("Installation");
      await expect(link).toBeVisible();
      await toggle.click();
      await expect(link).toBeHidden();
      await toggle.focus();
      await page.keyboard.press("Tab");
      await expect(q.link("Ariakit UI")).toBeFocused();
      await toggle.click();
      await expect(link).toBeVisible();
    });
  });

  test.describe("desktop", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("lands a fragment link below the sticky header", async ({
      page,
      q,
    }) => {
      await q.button("Toggle table of contents").click();
      await query(q.navigation("On this page")).link("Centering").click();
      await expect
        .poll(() => page.evaluate(() => location.hash))
        .toBe("#centering");
      const heading = q.heading("Centering", { level: 2 });
      const box = await getBox(heading);
      // The anchor's own margin keeps it at least one rem below the header. The
      // page's scroll padding, the documented rule for focused controls, adds
      // to that margin rather than replacing it.
      expect(box.y).toBeGreaterThanOrEqual(HEADER_HEIGHT + 16 - 1);
    });

    test("keeps every focused link below the sticky header on a tab through the page", async ({
      page,
      q,
    }) => {
      const links = query(q.main()).link(/^Back to the top/);
      await expect(links).toHaveCount(8);
      const header = q.banner();
      await q.link("link back to the top").focus();
      for (let index = 0; index < 8; index += 1) {
        await page.keyboard.press("Tab");
        const link = links.nth(index);
        await expect(link).toBeFocused();
        const [linkBox, headerBox] = await Promise.all([
          getBox(link),
          getBox(header),
        ]);
        expect(linkBox.y).toBeGreaterThanOrEqual(
          headerBox.y + headerBox.height,
        );
      }
    });
  });

  test.describe("captures", () => {
    test.describe.configure({ timeout: 120_000 });
    test.use({
      visual: async ({ page, visual }, use) => {
        await use(async (options) => {
          // Setup clicks can leave hover styles in these layout captures. Keep
          // the pointer outside the page, including when the viewport changes.
          // https://github.com/ariakit/ariakit/pull/7529
          await page.mouse.move(-1, -1);
          await visual(options);
        });
      },
    });

    test("docs site @visual", async ({ page, q, visual }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await forEachColorScheme(page, async (colorScheme) => {
        const toggle = q.button("Toggle table of contents");
        await toggle.click();
        await expect(q.navigation("On this page")).toBeVisible();
        await visual(getViewportCapture(page, colorScheme));
        await expect
          .poll(() => toggle.evaluate((node) => node.matches(":hover")))
          .toBe(false);
      });
    });

    test("sidebar combinations and right-to-left layout @visual", async ({
      page,
      q,
      visual,
    }) => {
      const viewport = { width: 1440, height: 900 };
      await page.setViewportSize(viewport);
      await forEachColorScheme(page, async (colorScheme) => {
        for (const direction of ["ltr", "rtl"]) {
          await q.checkbox("Right to left").setChecked(direction === "rtl");
          for (const sidebar of [
            "Toggle sidebar",
            "Toggle table of contents",
            "Toggle sidebar",
            "Toggle table of contents",
          ]) {
            await q.button(sidebar).click();
            await visual({
              ...getViewportCapture(page, colorScheme),
              id: direction,
              viewports: { wide: viewport },
            });
          }
        }
      });
    });

    test("sticky sidebar above the footer @visual", async ({
      page,
      q,
      visual,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await forEachColorScheme(page, async (colorScheme) => {
        await page.evaluate(() =>
          window.scrollTo(0, document.documentElement.scrollHeight),
        );
        await expect(q.contentinfo()).toBeInViewport({ ratio: 1 });
        await visual(getViewportCapture(page, colorScheme));
      });
    });

    test("bar sizing at a narrow width @visual", async ({
      page,
      q,
      visual,
    }) => {
      const viewport = { width: 560, height: 400 };
      await page.setViewportSize(viewport);
      await forEachColorScheme(page, async (colorScheme) => {
        await selectScenario(q, "bar");
        for (const sizing of ["Shrink the sides", "Grow the center"]) {
          await q.radio(sizing).check();
          await visual({
            ...getViewportCapture(page, colorScheme),
            id: sizing,
            viewports: { narrow: viewport },
          });
        }
        await selectScenario(q, "marketing");
        await visual({
          ...getViewportCapture(page, colorScheme),
          id: "stacked",
          viewports: { narrow: viewport },
        });
      });
    });

    test("docs site scrolled under the blurred header @visual", async ({
      page,
      visual,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await forEachColorScheme(page, async (colorScheme) => {
        await page.evaluate(() => window.scrollTo(0, 300));
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(300);
        await visual(getViewportCapture(page, colorScheme));
      });
    });

    test("blurred header in forced colors @visual", async ({
      page,
      visual,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.emulateMedia({ forcedColors: "active" });
      await forEachColorScheme(page, async (colorScheme) => {
        await page.evaluate(() => window.scrollTo(0, 300));
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(300);
        await visual(getViewportCapture(page, colorScheme));
      });
    });

    for (const scenario of [
      "dashboard",
      "chat",
      "marketing",
      "settings",
      "bar",
    ]) {
      test(`${scenario} @visual`, async ({ page, q, visual }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await forEachColorScheme(page, async (colorScheme) => {
          await selectScenario(q, scenario);
          await expect(q.combobox("Scenario")).toHaveValue(scenario);
          await visual(getViewportCapture(page, colorScheme));
        });
      });
    }
  });
});
