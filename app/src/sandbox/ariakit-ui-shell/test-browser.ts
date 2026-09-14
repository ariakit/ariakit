import { expect } from "@playwright/test";
import {
  forEachColorScheme,
  getViewportCapture,
} from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";
import {
  expectCentered,
  getBackdrop,
  getBox,
  getCenterOffset,
  getContent,
  getShell,
  getSidebar,
  getSidebarBody,
  sampleCenterOffset,
  selectScenario,
} from "./helpers.ts";

// The header height token, 3.25rem at the 16px root font size.
const HEADER_HEIGHT = 52;
// The shell's motion duration.
const DURATION = 300;

withFramework(import.meta.dirname, async ({ test, query }) => {
  test.describe("wide", () => {
    // Wide enough for full centering with the docs sidebars: 256 + 192 + 768
    // + 48 + 64 = 1328.
    test.use({ viewport: { width: 1440, height: 900 } });

    test("keeps the content column on the shell's center for every mix of open and closed sidebars", async ({
      page,
      q,
    }) => {
      const shell = getShell(page);
      const content = getContent(q);
      const navigation = q.button("Toggle sidebar");
      const contents = q.button("Toggle table of contents");
      // One sidebar open.
      await expectCentered(content, shell);
      // Two of uneven widths.
      await contents.click();
      await expect(getSidebar(q, "On this page")).toHaveAttribute("data-open");
      await expectCentered(content, shell);
      // The wider one closed.
      await navigation.click();
      await expect(getSidebar(q, "Documentation")).not.toHaveAttribute(
        "data-open",
      );
      await expectCentered(content, shell);
      // Both closed.
      await contents.click();
      await expectCentered(content, shell);
      // The content column keeps its maximum width throughout.
      const { width } = await getBox(content);
      expect(width).toBe(768);
    });

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
      await expect(sidebar).toHaveCSS("width", "256px");
      await expect(link).toBeVisible();
      await toggle.click();
      await expect(sidebar).toHaveCSS("width", "0px");
      await expect(link).toBeHidden();
      await toggle.focus();
      await page.keyboard.press("Tab");
      await expect(q.link("Ariakit UI")).toBeFocused();
      await toggle.click();
      await expect(sidebar).toHaveCSS("width", "256px");
      await expect(link).toBeVisible();
    });

    test("mirrors the layout in right to left", async ({ page, q }) => {
      const shell = getShell(page);
      const content = getContent(q);
      await q.checkbox("Right to left").check();
      await q.button("Toggle table of contents").click();
      const navigation = await getBox(getSidebar(q, "Documentation"));
      const contents = await getBox(getSidebar(q, "On this page"));
      // The start sidebar sits at the right edge, the end sidebar at the left.
      expect(navigation.x + navigation.width).toBeCloseTo(1440, 0);
      expect(contents.x).toBeCloseTo(0, 0);
      await expectCentered(content, shell);
      // The header parts swap edges too.
      const toggle = await getBox(q.button("Toggle sidebar"));
      expect(toggle.x).toBeGreaterThan(1440 / 2);
    });

    test("places two sidebars on one side in DOM order from the edge", async ({
      q,
    }) => {
      await selectScenario(q, "chat");
      const rail = await getBox(getSidebar(q, "Workspaces"));
      const channels = await getBox(getSidebar(q, "Channels"));
      const members = await getBox(getSidebar(q, "Members"));
      expect(rail.x).toBe(0);
      expect(rail.width).toBe(56);
      expect(channels.x).toBe(56);
      expect(channels.width).toBe(240);
      // Closed: the end slot reserves nothing.
      expect(members.width).toBe(0);
      // An unconditional overlay: the column keeps reserving nothing and the
      // body floats over main from the end edge.
      await q.button("Toggle members").click();
      const body = getSidebarBody(getSidebar(q, "Members"));
      await expect(body).toBeVisible();
      await expect(getSidebar(q, "Members")).toHaveCSS("width", "0px");
      await expect
        .poll(async () => {
          const box = await getBox(body);
          return box.x + box.width;
        })
        .toBe(1440);
      expect((await getBox(body)).width).toBe(224);
      await expect(getBackdrop(getSidebar(q, "Members"))).toBeVisible();
    });
  });

  test.describe("desktop", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("sticks the header and the sidebar body below it while the page scrolls", async ({
      page,
      q,
    }) => {
      const header = q.banner();
      const body = getSidebarBody(getSidebar(q, "Documentation"));
      await expect(header).toHaveCSS("height", `${HEADER_HEIGHT}px`);
      await page.evaluate(() => window.scrollTo(0, 800));
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(800);
      expect((await getBox(header)).y).toBe(0);
      expect((await getBox(body)).y).toBe(HEADER_HEIGHT);
      // The body is capped to the viewport below the header.
      expect((await getBox(body)).height).toBe(800 - HEADER_HEIGHT);
    });

    test("lets a static footer of any height push the sticky sidebar body up at the end of the page", async ({
      page,
      q,
    }) => {
      const footer = q.contentinfo();
      const body = getSidebarBody(getSidebar(q, "Documentation"));
      await page.evaluate(() =>
        window.scrollTo(0, document.documentElement.scrollHeight),
      );
      await expect(footer).toBeInViewport({ ratio: 1 });
      const footerBox = await getBox(footer);
      const bodyBox = await getBox(body);
      expect(footerBox.height).toBeGreaterThan(HEADER_HEIGHT);
      expect(bodyBox.y + bodyBox.height).toBeLessThanOrEqual(footerBox.y);
    });

    test("puts a bare element passed to a bar prop in its part cell", async ({
      q,
    }) => {
      const footer = q.contentinfo();
      const footerBox = await getBox(footer);
      const start = await getBox(
        query(footer).text("Made with the Shell component"),
      );
      const end = await getBox(query(footer).link("Back to top"));
      // The docs footer passes a div and a link, not part elements. Without the
      // part around them the grid would auto-place the link in the middle track
      // instead of at the end edge.
      expect(start.x).toBeLessThan(footerBox.x + footerBox.width / 3);
      expect(end.x + end.width).toBeGreaterThan(
        footerBox.x + (footerBox.width * 2) / 3,
      );
    });

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

    test("leaves no gaps with zero sidebars", async ({ page, q }) => {
      await selectScenario(q, "marketing");
      const shell = await getBox(getShell(page));
      const main = await getBox(q.main());
      expect(main.x).toBe(shell.x);
      expect(main.width).toBe(shell.width);
      await expectCentered(getContent(q), getShell(page));
      expect((await getBox(getContent(q))).width).toBe(1024);
      // The header scrolls away with the page.
      await page.evaluate(() => window.scrollTo(0, 400));
      await expect(q.banner()).not.toBeInViewport();
    });

    test("centers within main only with the main centering", async ({
      page,
      q,
    }) => {
      await selectScenario(q, "settings");
      const main = q.main();
      const content = getContent(q);
      await expectCentered(content, main);
      const offset = await getCenterOffset(content, getShell(page));
      // The sidebar's half width: no compensation.
      expect(offset).toBeCloseTo(112, 0);
    });

    test("puts a panel in overlay mode when a nested shell narrows, without the window changing", async ({
      page,
      q,
    }) => {
      await selectScenario(q, "dashboard");
      const details = getSidebar(q, "Details");
      const body = getSidebarBody(details);
      // The inner shell is 1280 - 224 = 1056px wide: above the 64rem step.
      await q.button("Toggle details").click();
      await expect(details).toHaveCSS("width", "288px");
      await expect(getBackdrop(details)).toBeHidden();
      // Narrow the window under the step while the navigation is open.
      await page.setViewportSize({ width: 1200, height: 800 });
      await expect(details).toHaveCSS("width", "0px");
      await expect(body).toBeVisible();
      // A panel that is never modal renders no backdrop at all.
      await expect(getBackdrop(details)).toHaveCount(0);
      expect((await getBox(body)).x + 288).toBe(1200);
      // Closing the navigation widens the inner shell past the step again.
      await q.button("Toggle sidebar").click();
      await expect(details).toHaveCSS("width", "288px");
      await expect(getBackdrop(details)).toBeHidden();
    });

    test("spans the gutters of main from a bleed wrapper or a bleed frame, only as a direct child of main", async ({
      q,
    }) => {
      const main = await getBox(q.main());
      const content = await getBox(getContent(q));
      const band = await getBox(
        q.text("A full-bleed band inside the centered main"),
      );
      const frame = await getBox(
        q.text("A full-bleed frame inside the centered main").locator(".."),
      );
      const badge = await getBox(q.text("Badge"));
      expect(content.width).toBeLessThan(main.width);
      expect(band.x).toBe(main.x);
      expect(band.width).toBe(main.width);
      expect(frame.x).toBe(main.x);
      expect(frame.width).toBe(main.width);
      // The badge is a bleed inside a flex row: it keeps its content size. With
      // the containment it would be as wide as its padding alone, under 16px,
      // with its text overflowing.
      expect(badge.width).toBeGreaterThan(32);
      expect(badge.width).toBeLessThan(content.width);
      expect(badge.x).toBeGreaterThan(main.x);
    });

    test("reflows main's content with the width main has", async ({ q }) => {
      await selectScenario(q, "dashboard");
      const cards = q.group("Metrics");
      const columns = () =>
        cards.evaluate(
          (node) =>
            getComputedStyle(node).gridTemplateColumns.split(" ").length,
        );
      // Main is 1056px wide: three columns at the 56rem step.
      await expect.poll(columns).toBe(3);
      // The detail panel takes 288px off main.
      await q.button("Toggle details").click();
      await expect.poll(columns).toBe(2);
    });
  });

  test.describe("bar parts", () => {
    test("keeps the center on the bar's middle while both sides fit and moves it over when a side needs the room", async ({
      page,
      q,
    }) => {
      await page.setViewportSize({ width: 900, height: 400 });
      await selectScenario(q, "bar");
      const bar = q.banner();
      const center = bar.locator(".shell-bar-center");
      await expectCentered(center, bar);
      await page.setViewportSize({ width: 560, height: 400 });
      // The 256px start part needs more than its half of the 512px content
      // width, so the center moves over.
      await expect.poll(() => getCenterOffset(center, bar)).toBeGreaterThan(16);
      // Shrinking the sides re-centers the title and truncates the sides.
      await q.radio("Shrink the sides").check();
      await expectCentered(center, bar);
      const start = await getBox(query(bar).text(/^A start part/));
      expect(start.width).toBeLessThan(256);
    });

    test("grows the center part while it stays centered", async ({
      page,
      q,
    }) => {
      // Both sides fit in a quarter of the bar's 1152px of content, so the
      // double share keeps the center on the middle.
      await page.setViewportSize({ width: 1200, height: 400 });
      await selectScenario(q, "bar");
      const bar = q.banner();
      const center = bar.locator(".shell-bar-center");
      const plain = await getBox(center);
      await q.radio("Grow the center").check();
      await expect
        .poll(async () => (await getBox(center)).width)
        .toBeGreaterThan(plain.width + 100);
      await expectCentered(center, bar);
    });

    test("stacks the center part on a second row of a narrow bar", async ({
      page,
      q,
    }) => {
      await page.setViewportSize({ width: 560, height: 400 });
      await selectScenario(q, "marketing");
      const bar = q.banner();
      const brand = await getBox(query(bar).link("Ariakit UI"));
      const site = await getBox(query(bar).navigation("Site"));
      expect(site.y).toBeGreaterThan(brand.y + brand.height);
      await expectCentered(query(bar).navigation("Site"), bar);
    });
  });

  test.describe("phone", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("floats an overlay sidebar over main from a column that reserves nothing", async ({
      page,
      q,
    }) => {
      const sidebar = getSidebar(q, "Documentation");
      const body = getSidebarBody(sidebar);
      const backdrop = getBackdrop(sidebar);
      await expect(sidebar).toHaveCSS("width", "0px");
      await expect(backdrop).toBeVisible();
      const bodyBox = await getBox(body);
      expect(bodyBox.x).toBe(0);
      expect(bodyBox.width).toBe(256);
      expect(bodyBox.y).toBe(HEADER_HEIGHT);
      // Main takes the full width under the drawer.
      expect((await getBox(q.main())).width).toBe(390);
      // The header is inert behind the modal drawer, so Escape closes it.
      await page.keyboard.press("Escape");
      await expect(body).toBeHidden();
      await expect(backdrop).toBeHidden();
      await expect(q.link("The grid")).toBeHidden();
    });

    test("slides an end sidebar in from the end edge", async ({ page, q }) => {
      // Close the navigation drawer first, so one drawer is open at a time.
      await page.keyboard.press("Escape");
      const contents = getSidebar(q, "On this page");
      const body = getSidebarBody(contents);
      await q.button("Toggle table of contents").click();
      await expect(body).toBeVisible();
      // The body slides in over the shell's duration, so its edge settles.
      await expect
        .poll(async () => {
          const box = await getBox(body);
          return box.x + box.width;
        })
        .toBe(390);
      expect((await getBox(body)).width).toBe(192);
    });

    test("slides the drawer from the right edge in right to left", async ({
      page,
      q,
    }) => {
      const sidebar = getSidebar(q, "Documentation");
      const body = getSidebarBody(sidebar);
      // The direction switch is hidden on a narrow bar and inert behind the
      // drawer, so it is set on a wide window first.
      await page.setViewportSize({ width: 1280, height: 800 });
      await q.checkbox("Right to left").check();
      await page.setViewportSize({ width: 390, height: 844 });
      // The open drawer sits at the start edge, now the right one.
      await expect
        .poll(async () => {
          const box = await getBox(body);
          return box.x + box.width;
        })
        .toBe(390);
      // The header is inert behind the modal drawer, so Escape closes it.
      await page.keyboard.press("Escape");
      await expect(body).toBeHidden();
      // Closed, it has left through the right edge, not the left one.
      await expect
        .poll(async () => (await getBox(body)).x)
        .toBeGreaterThanOrEqual(390);
    });
  });

  test.describe("captures", () => {
    test.describe.configure({ timeout: 120_000 });

    test("docs site @visual", async ({ page, q, visual }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await forEachColorScheme(page, async (colorScheme) => {
        await q.button("Toggle table of contents").click();
        await expect(getSidebar(q, "On this page")).toHaveCSS("width", "192px");
        await visual(getViewportCapture(page, colorScheme));
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

    test("docs site with the drawer open on a phone @visual", async ({
      page,
      q,
      visual,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await forEachColorScheme(page, async (colorScheme) => {
        await expect(q.dialog("Documentation")).toBeVisible();
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

    for (const scenario of ["dashboard", "chat", "marketing"]) {
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
