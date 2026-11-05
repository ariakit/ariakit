import type { Page } from "@playwright/test";
import { PNG } from "pngjs";
import { withFramework } from "#app/test-utils/preview.ts";

interface Clip {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Reads the red channel of each pixel in a page region, row by row. The Chrome
// project renders one device pixel per CSS pixel, and the tabs are gray, so red
// follows lightness.
async function getRedRows(page: Page, clip: Clip) {
  const buffer = await page.screenshot({ clip });
  const { data } = PNG.sync.read(buffer);
  return Array.from({ length: clip.height }, (_, row) =>
    Array.from(
      { length: clip.width },
      (_, column) => data[(row * clip.width + column) * 4] ?? 0,
    ),
  );
}

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("moves keyboard focus between tabs without selecting", async ({
    page,
    q,
  }) => {
    const box = query(q.article("Folder tabs"));
    await box.tab("Code").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(box.tab("Usage")).toBeFocused();
    await test
      .expect(box.tab("Usage"))
      .toHaveAttribute("aria-selected", "false");
    await test.expect(box.tab("Code")).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Enter");
    await test
      .expect(box.tab("Usage"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(box.tab("Code"))
      .toHaveAttribute("aria-selected", "false");
  });

  test("lets an overflowing strip scroll to the tabs that do not fit", async ({
    page,
    q,
  }) => {
    const strip = query(q.article("Overflowing strip")).tablist(
      "Overflowing strip",
    );
    await strip.hover();
    await page.mouse.wheel(400, 0);
    await test.expect
      .poll(() => strip.evaluate((node) => node.scrollLeft))
      .toBeGreaterThan(0);
  });

  test("selects a folder tab without animating its curves or the panel corners", async ({
    q,
  }) => {
    const box = query(q.article("Full-width strip with the last tab selected"));
    await box.tab("Preview").click();
    const usage = box.tab("Usage");
    // Records the curves and the panel corners on the frames after the tab is
    // selected. A transition, or a curve that overflows the strip for a moment,
    // shows as more than one value. The promise stays open while Playwright
    // clicks the tab.
    const recording = usage.evaluate((tab) => {
      const panel = tab
        .closest(".tabs")
        ?.querySelector(":scope > [role=tablist] + *");
      if (!panel) throw new Error("Missing tab panels");
      const sizes = new Set<string>();
      return new Promise<string[]>((resolve) => {
        let selectedFrames = 0;
        let frames = 0;
        const record = () => {
          frames += 1;
          if (tab.getAttribute("aria-selected") === "true") {
            selectedFrames += 1;
            const curves = `${getComputedStyle(tab, "::before").width} ${getComputedStyle(tab, "::after").width}`;
            const { borderTopLeftRadius, borderTopRightRadius } =
              getComputedStyle(panel);
            sizes.add(
              `${curves} ${borderTopLeftRadius} ${borderTopRightRadius}`,
            );
          }
          // 30 frames outlast a tab transition. The total cap ends the record
          // if the click never selects the tab.
          if (selectedFrames > 30 || frames > 600) {
            resolve([...sizes]);
            return;
          }
          requestAnimationFrame(record);
        };
        requestAnimationFrame(record);
      });
    });
    await usage.click();
    await test.expect(usage).toHaveAttribute("aria-selected", "true");
    test.expect(await recording).toHaveLength(1);
  });

  // Regression fixtures.
  for (const name of ["Project", "Team"]) {
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781700
    test(`keeps the ${name.toLowerCase()} panel visible with an explicit store`, async ({
      q,
    }) => {
      const box = query(q.article("Tab panel shared store"));
      await test.expect(box.tabpanel(`${name} activity`)).toBeVisible();
      await box.tab(`${name} reviews`).click();
      await test.expect(box.tabpanel(`${name} reviews`)).toBeVisible();
      await test.expect(box.text(`${name} review updates`)).toBeVisible();
      await box.tab(`${name} activity`).click();
      await test.expect(box.tabpanel(`${name} activity`)).toBeVisible();
      await test.expect(box.text(`${name} activity updates`)).toBeVisible();
    });
  }

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781700
  test("preserves an explicit tabId on a single panel", async ({ q }) => {
    const box = query(q.article("Tab panel shared store"));
    await test.expect(box.tabpanel("Pinned activity")).toBeVisible();
    await box.tab("Pinned reviews").click();
    await test
      .expect(box.tab("Pinned reviews"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(box.tabpanel("Pinned activity")).not.toBeVisible();
    await box.tab("Pinned activity").click();
    await test.expect(box.tabpanel("Pinned activity")).toBeVisible();
  });

  test("a tabs record keys its tabs and passes tab props", async ({
    page,
    q,
  }) => {
    const box = query(q.article("Tabs record"));
    // defaultSelectedId names a record key, so the keys are the tab ids.
    await test
      .expect(box.tab("Usage"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(box.tab("Code")).toHaveAttribute("aria-disabled", "true");

    await box.tab("Preview").click();
    await test
      .expect(box.tab("Preview"))
      .toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await test.expect(box.tab("Code")).toBeFocused();
    await test
      .expect(box.tab("Code"))
      .toHaveAttribute("aria-selected", "false");
    await test
      .expect(box.tab("Preview"))
      .toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await test
      .expect(box.tab("Usage"))
      .toHaveAttribute("aria-selected", "true");
  });

  for (const colorScheme of ["light", "dark"] as const) {
    for (const contrast of ["no-preference", "more"] as const) {
      test(`gives the panel and the selected folder the root edge in ${colorScheme} mode with ${contrast} contrast`, async ({
        page,
        q,
      }) => {
        await page.emulateMedia({ colorScheme, contrast });
        for (const [name, selected] of [
          ["Folder tabs", "Code"],
          ["Without padding", "Preview"],
          ["Thick edge", "Code"],
          ["Bold edge", "Usage"],
          ["Hidden root edge", "Code"],
          ["Adaptive root edge", "Code"],
        ] as const) {
          const tab = query(q.article(name)).tab(selected);
          await test.expect(tab).toHaveAttribute("aria-selected", "true");
          const edges = await tab.evaluate((element) => {
            const root = element.closest(".tabs");
            const panels = root?.querySelector(":scope > [role=tablist] + *");
            if (!root) {
              throw new Error("Missing tabs root");
            }
            if (!panels) {
              throw new Error("Missing tab panels");
            }
            const rootStyle = getComputedStyle(root);
            const panelStyle = getComputedStyle(panels);
            const tabStyle = getComputedStyle(element);
            return {
              rootColor: rootStyle.getPropertyValue("--ak-edge"),
              rootWidth:
                Number.parseFloat(rootStyle.borderTopWidth) +
                Number.parseFloat(
                  rootStyle.getPropertyValue("--ak-frame-ring"),
                ),
              panelColor: panelStyle.borderLeftColor,
              panelWidth: Number.parseFloat(panelStyle.borderLeftWidth),
              tabColor: tabStyle.borderLeftColor,
              tabWidth: Number.parseFloat(tabStyle.borderLeftWidth),
            };
          });
          // A border, with the width and color of the root edge, so increased
          // contrast strengthens it once, as it does the root edge.
          test.expect(edges.panelWidth).toBe(edges.rootWidth);
          test.expect(edges.tabWidth).toBe(edges.rootWidth);
          // A hidden edge serializes its channels differently, but stays
          // transparent.
          if (/\/ 0\)$/.test(edges.rootColor)) {
            test.expect(edges.panelColor).toMatch(/\/ 0\)$/);
            test.expect(edges.tabColor).toMatch(/\/ 0\)$/);
            continue;
          }
          test.expect(edges.panelColor).toBe(edges.rootColor);
          test.expect(edges.tabColor).toBe(edges.rootColor);
        }
      });
    }
  }

  test("paints the strip color under the panel and the selected folder", async ({
    page,
    q,
  }) => {
    // Light surfaces draw the root edge as a ring, which the borders lie on.
    await page.emulateMedia({ colorScheme: "light" });
    for (const [name, selected, panelSurface, tabSurface] of [
      ["Without padding", "Preview", "strip", "strip"],
      // A hidden root ring would leave the strip color as a line around the
      // panel, which lies outside the root, so the panel takes the page. The
      // folder takes its own surface.
      ["Adaptive root edge", "Code", "page", "folder"],
    ] as const) {
      const tab = query(q.article(name)).tab(selected);
      await test.expect(tab).toHaveAttribute("aria-selected", "true");
      const surfaces = await tab.evaluate((element) => {
        const root = element.closest(".tabs");
        const strip = root?.querySelector(":scope > [role=tablist]");
        const panels = strip?.nextElementSibling;
        if (!(element instanceof HTMLElement)) {
          throw new Error("Missing tab");
        }
        if (!(root instanceof HTMLElement)) {
          throw new Error("Missing tabs root");
        }
        if (!(strip instanceof HTMLElement)) {
          throw new Error("Missing tab strip");
        }
        if (!(panels instanceof HTMLElement)) {
          throw new Error("Missing tab panels");
        }
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) {
          throw new Error("Missing 2D context");
        }
        // A style property resolves the variable, and a canvas converts the
        // color to 8-bit sRGB, so colors from different spaces compare.
        const paint = (node: HTMLElement, value: string) => {
          node.style.outlineColor = value;
          context.fillStyle = getComputedStyle(node).outlineColor;
          node.style.outlineColor = "";
          context.fillRect(0, 0, 1, 1);
          return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
        };
        return {
          strip: paint(strip, "var(--ak-layer)"),
          page: paint(root, "var(--ak-layer-parent)"),
          folder: paint(element, "var(--ak-layer)"),
          tab: paint(element, "var(--ak-frame-backdrop)"),
          panel: paint(panels, "var(--ak-frame-backdrop)"),
        };
      });
      test.expect(surfaces.strip).not.toEqual(surfaces.page);
      test.expect(surfaces.panel).toEqual(surfaces[panelSurface]);
      test.expect(surfaces.tab).toEqual(surfaces[tabSurface]);
    }
  });

  test("leaves no line above a selected folder on a hidden root edge", async ({
    page,
    q,
  }) => {
    // Light surfaces draw the root edge as a ring. Without padding, the top
    // border of the selected folder lies on that ring, outside the root.
    await page.emulateMedia({ colorScheme: "light" });
    const tab = query(q.article("Adaptive root edge without padding")).tab(
      "Code",
    );
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    await tab.scrollIntoViewIfNeeded();
    const box = await tab.boundingBox();
    if (!box) {
      throw new Error("Missing tab box");
    }
    // Read a column of pixels across the top edge, from the page above the root
    // to the folder fill.
    const rows = await getRedRows(page, {
      x: Math.floor(box.x + box.width / 2),
      y: Math.floor(box.y) - 3,
      width: 1,
      height: 7,
    });
    const reds = rows.flat();
    const pageRed = reds[0] ?? 0;
    const fillRed = reds[6] ?? 0;
    // Each pixel is the page, the folder fill, or a blend of the two. The strip
    // color is darker than both.
    for (const red of reds) {
      test.expect(red).toBeGreaterThanOrEqual(Math.min(pageRed, fillRed) - 1);
    }
  });

  test("keeps one edge color where a folder curve meets the straight edges on a hidden root edge", async ({
    page,
    q,
  }) => {
    // A root edge hidden by its weight shows with more contrast. The bottom
    // curve of the selected folder overlaps its side border and the panel's top
    // border.
    await page.emulateMedia({ colorScheme: "light", contrast: "more" });
    const tab = query(q.article("Adaptive root edge")).tab("Code");
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    await tab.scrollIntoViewIfNeeded();
    const box = await tab.boundingBox();
    if (!box) {
      throw new Error("Missing tab box");
    }
    // Read rows across the start side, from the middle of the folder down past
    // the seam, and keep the edge, which is the darkest pixel of each row.
    const top = Math.floor(box.y + box.height / 2);
    const rows = await getRedRows(page, {
      x: Math.floor(box.x) - 3,
      y: top,
      width: 7,
      height: Math.ceil(box.y + box.height) - top + 2,
    });
    const edges = rows.map((row) => Math.min(...row));
    const side = edges[0] ?? 0;
    // The edge shows with more contrast, so the rows below measure it.
    test.expect(side).toBeLessThan(Math.max(...(rows[0] ?? [])) - 20);
    // A translucent edge that paints twice is darker than the straight side.
    for (const edge of edges) {
      test.expect(edge).toBeGreaterThanOrEqual(side - 3);
    }
  });
});
