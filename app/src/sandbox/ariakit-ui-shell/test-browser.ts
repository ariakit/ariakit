import { expect } from "@playwright/test";
import {
  forEachColorScheme,
  getCapture,
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

// The default header contains its facing border within its 64px outer height.
const CONTROL_HEIGHT = 40;
const PART_PADDING = 12;
const HEADER_BORDER = 1;
const HEADER_HEIGHT = CONTROL_HEIGHT + PART_PADDING * 2;
const CONTENT_WIDTH = 768;
// The shell's motion duration.
const DURATION = 300;

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/pull/7536#discussion_r4023543418
  test("keeps the sticky sidebar below a header with a caller shell style", async ({
    q,
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.evaluate(() => window.scrollTo(0, 300));
    await expect
      .poll(async () => {
        const [header, sidebar] = await Promise.all([
          getBox(q.banner()),
          getBox(q.navigation("Documentation")),
        ]);
        return sidebar.y - header.y - header.height;
      })
      .toBeCloseTo(0, 0);
  });

  test("centers a default header button inside the border", async ({
    q,
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const header = await getBox(q.banner());
    const button = await getBox(q.button("Toggle sidebar"));
    expect(button.height).toBeCloseTo(CONTROL_HEIGHT, 0);
    expect(header.height).toBeCloseTo(HEADER_HEIGHT, 0);
    expect(button.x - header.x).toBeCloseTo(PART_PADDING, 0);
    expect(button.y - header.y).toBeCloseTo(
      PART_PADDING - HEADER_BORDER / 2,
      0,
    );
    expect(
      header.y + header.height - button.y - button.height - HEADER_BORDER,
    ).toBeCloseTo(PART_PADDING - HEADER_BORDER / 2, 0);
  });

  test("shrinks breakouts before content and keeps only the main gutter on mobile", async ({
    q,
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await q.button("Toggle sidebar").click();
    await expect(getSidebar(q, "Documentation")).toHaveCSS("width", "0px");
    for (const width of [1200, 960, 820, 768, 560, 360]) {
      await page.setViewportSize({ width, height: 900 });
      await expect
        .poll(async () => (await getBox(getContent(q))).width)
        .toBeCloseTo(Math.min(CONTENT_WIDTH, width - PART_PADDING * 2), 0);
      if (width <= CONTENT_WIDTH) {
        expect((await getBox(getContent(q))).x).toBeCloseTo(PART_PADDING, 0);
      }
    }
  });

  test.describe("responsive toggles", () => {
    test.use({ viewport: { width: 1600, height: 900 } });

    for (const scenario of ["docs", "dashboard", "chat", "settings"]) {
      // https://github.com/ariakit/ariakit/pull/7533#discussion_r4020675160
      test(`${scenario} hides toggles below their sidebar collapse width`, async ({
        page,
        q,
      }) => {
        await selectScenario(q, scenario);
        const toggles = q
          .button(undefined, { includeHidden: true })
          .and(page.locator("[aria-controls][aria-expanded]"));
        await expect(toggles).toHaveCount(scenario === "settings" ? 1 : 2);
        const permanentToggle = q.button("Toggle sidebar");
        for (const toggle of await toggles.all()) {
          await expect(toggle).toBeVisible();
          if ((await toggle.getAttribute("aria-expanded")) === "false") {
            await toggle.click();
          }
          await expect(toggle).toHaveAttribute("aria-expanded", "true");
          const panelId = await toggle.getAttribute("aria-controls");
          await expect(page.locator(`[id="${panelId}"]`)).toBeVisible();
        }

        // The nested dashboard shell must use its own width, even while the
        // outer shell stays above the default 768px collapse step.
        await page.setViewportSize({
          width: scenario === "dashboard" ? 900 : 560,
          height: 900,
        });
        for (const toggle of await toggles.all()) {
          const panelId = await toggle.getAttribute("aria-controls");
          const panel = page.locator(`[id="${panelId}"]`);
          if (
            scenario === "dashboard" &&
            (await toggle.getAttribute("aria-label")) === "Toggle sidebar"
          ) {
            await expect(toggle).toBeVisible();
            await expect(panel).toBeVisible();
          } else {
            await expect(panel).toBeHidden();
            await expect(toggle).toBeHidden();
          }
        }
        if (scenario === "dashboard") {
          await permanentToggle.click();
          await expect(q.navigation("Workspace")).toBeHidden();
          await permanentToggle.click();
          await expect(q.navigation("Workspace")).toBeVisible();
        }

        await page.setViewportSize({ width: 1600, height: 900 });
        for (const toggle of await toggles.all()) {
          await expect(toggle).toBeVisible();
          await expect(toggle).toHaveAttribute("aria-expanded", "true");
          const panelId = await toggle.getAttribute("aria-controls");
          await expect(page.locator(`[id="${panelId}"]`)).toBeVisible();
        }
      });
    }
  });

  test.describe("wide", () => {
    // Full centering with the start sidebar needs 256 + 768 + 24 + 144 + 256
    // pixels, including the two pairs of breakout tracks.
    test.use({ viewport: { width: 1600, height: 900 } });

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

    for (const scenario of ["docs", "dashboard"]) {
      // https://github.com/ariakit/ariakit/issues/7532
      test(`${scenario} at wide and narrow widths @visual`, async ({
        page,
        q,
        visual,
      }) => {
        await forEachColorScheme(page, async (colorScheme) => {
          await selectScenario(q, scenario);
          await visual({
            ...getViewportCapture(
              page,
              colorScheme,
              `ariakit-ui-shell/${scenario}-responsive`,
            ),
            viewports: {
              wide: { width: 1440, height: 900 },
              narrow: { width: 560, height: 900 },
            },
          });
        });
      });
    }

    // https://github.com/ariakit/ariakit/issues/7532
    test("flush band at the shell radius @visual", async ({
      page,
      q,
      visual,
    }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        await selectScenario(q, "geometry");
        await q.checkbox("Flush gutter").check();
        const frame = page.locator('[aria-label="Flush frame"]');
        await visual({
          ...getCapture(frame, colorScheme, {
            item: "ariakit-ui-shell/flush-band",
            fullPage: true,
          }),
          viewports: {
            wide: { width: 1440, height: 900 },
            narrow: { width: 560, height: 900 },
          },
        });
      });
    });

    test("docs site @visual", async ({ page, q, visual }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await forEachColorScheme(page, async (colorScheme) => {
        const toggle = q.button("Toggle table of contents");
        await toggle.click();
        await expect(q.navigation("On this page")).toBeVisible();
        await visual(
          getViewportCapture(page, colorScheme, "ariakit-ui-shell/docs-site"),
        );
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
          for (const [state, sidebar] of [
            ["sidebar-closed", "Toggle sidebar"],
            ["toc-closed", "Toggle table of contents"],
            ["sidebar-open", "Toggle sidebar"],
            ["toc-open", "Toggle table of contents"],
          ] as const) {
            await q.button(sidebar).click();
            await visual({
              ...getViewportCapture(
                page,
                colorScheme,
                `ariakit-ui-shell/sidebar-combinations/${direction}-${state}`,
              ),
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
        await visual(
          getViewportCapture(
            page,
            colorScheme,
            "ariakit-ui-shell/sticky-sidebar-footer",
          ),
        );
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
        for (const [key, sizing] of [
          ["shrink-sides", "Shrink the sides"],
          ["grow-center", "Grow the center"],
        ] as const) {
          await q.radio(sizing).check();
          await visual({
            ...getViewportCapture(
              page,
              colorScheme,
              `ariakit-ui-shell/bar-sizing/${key}`,
            ),
            id: sizing,
            viewports: { narrow: viewport },
          });
        }
        await selectScenario(q, "marketing");
        await visual({
          ...getViewportCapture(
            page,
            colorScheme,
            "ariakit-ui-shell/bar-sizing/stacked",
          ),
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
        await visual(
          getViewportCapture(
            page,
            colorScheme,
            "ariakit-ui-shell/docs-site-scrolled",
          ),
        );
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
          await visual(
            getViewportCapture(
              page,
              colorScheme,
              `ariakit-ui-shell/${scenario}-default`,
            ),
          );
        });
      });
    }
  });
});
