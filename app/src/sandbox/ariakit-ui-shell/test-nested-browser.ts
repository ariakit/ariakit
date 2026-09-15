import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox, getSidebar, selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ q }) => {
    await selectScenario(q, "nested");
  });

  // https://github.com/ariakit/ariakit/issues/7532
  test("stacks three sticky headers and sidebars and updates only the changed depth", async ({
    page,
    q,
  }) => {
    const shells = ["Outer", "Middle", "Inner"].map((name) =>
      page.locator(`[aria-label="${name} shell"]`),
    );
    const headers = shells.map((shell) =>
      shell.locator(":scope > .shell-header"),
    );
    const heights = [44, 52, 64];
    const offsets = [0, 44, 96];
    const widths = [160, 192, 160];
    await page.evaluate(() => window.scrollTo(0, 500));
    for (const [index, name] of ["Outer", "Middle", "Inner"].entries()) {
      const shell = shells[index];
      const header = headers[index];
      const height = heights[index];
      const offset = offsets[index];
      if (!shell || !header || height == null || offset == null)
        throw new Error("Missing shell depth");
      await expect(header).toHaveCSS("height", `${height}px`);
      await expect
        .poll(async () => (await getBox(header)).y)
        .toBeCloseTo(offset, 0);
      await expect
        .poll(async () => (await getBox(q.navigation(`${name} navigation`))).y)
        .toBeCloseTo(offset + height, 0);
      await expect(getSidebar(q, `${name} navigation`)).toHaveCSS(
        "width",
        `${widths[index]}px`,
      );
      await expect(shell).toHaveCSS("isolation", "isolate");
      await expect(shell).toHaveCSS("overflow-x", "visible");
    }
    await q.checkbox("Taller middle header").check();
    await page.evaluate(() => window.scrollTo(0, 500));
    const [outerHeader, middleHeader, innerHeader] = headers;
    if (!outerHeader || !middleHeader || !innerHeader)
      throw new Error("Missing headers");
    await expect(outerHeader).toHaveCSS("height", "44px");
    await expect(middleHeader).toHaveCSS("height", "64px");
    await expect
      .poll(async () => (await getBox(innerHeader)).y)
      .toBeCloseTo(108, 0);
    await expect
      .poll(async () => (await getBox(q.navigation("Inner navigation"))).y)
      .toBeCloseTo(172, 0);
    await expect(q.navigation("Outer navigation")).toHaveCSS("top", "44px");
  });

  // https://github.com/ariakit/ariakit/issues/7532
  test("paints an overlay with automatic z-index above every shell header", async ({
    page,
    q,
  }) => {
    await q.button("Open overlay").click();
    const overlay = q.dialog("Shell overlay");
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveCSS("z-index", "auto");
    expect(
      await overlay.evaluate((node) =>
        node.contains(document.elementFromPoint(20, 20)),
      ),
    ).toBe(true);
    await q.button("Close overlay").click();
    await expect(overlay).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, 500));
    const header = page.locator('[aria-label="Outer shell"] > .shell-header');
    expect(
      await header.evaluate((node) =>
        node.contains(document.elementFromPoint(20, 20)),
      ),
    ).toBe(true);
  });

  // https://github.com/ariakit/ariakit/issues/7532
  test("slides an inner header under its parent when the inner shell ends", async ({
    page,
  }) => {
    const inner = page.locator('[aria-label="Inner shell"]');
    const middleHeader = page.locator(
      '[aria-label="Middle shell"] > .shell-header',
    );
    const innerHeader = inner.locator(":scope > .shell-header");
    await inner.evaluate((node) => {
      const bottom = node.getBoundingClientRect().bottom + window.scrollY;
      // A bottom at 72px puts the 64px inner header across the middle header,
      // which sticks between 44px and 96px.
      window.scrollTo(0, bottom - 72);
    });
    await expect
      .poll(async () => (await getBox(innerHeader)).y)
      .toBeLessThan(44);
    const innerBox = await getBox(innerHeader);
    expect(
      await middleHeader.evaluate(
        (node, x) => node.contains(document.elementFromPoint(x, 60)),
        innerBox.x + 20,
      ),
    ).toBe(true);
  });
});
